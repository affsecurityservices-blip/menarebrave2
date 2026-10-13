import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [onboardingState, setOnboardingState] = useState({
    oathAccepted: false,
    age: null,
    interests: [],
    username: '',
    avatar: 'batman', // default avatar tag
    anonymousMode: true, // default anonymous
  });

  const fetchUserProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (data) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          phone: data.phone,
          securityQuestion: data.security_question,
          username: data.username,
          avatar: data.avatar,
          streakCount: data.streak_count,
          hasCheckedInToday: data.has_checked_in_today,
          hasCompletedResolveToday: data.has_completed_resolve_today,
          isPremium: false,
          isAnonymous: onboardingState.anonymousMode,
        });
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email,
          phone: authUser.email?.split('@')[0],
          username: authUser.user_metadata?.username || authUser.email.split('@')[0],
          avatar: authUser.user_metadata?.avatar || 'batman',
          streakCount: 3,
          hasCheckedInToday: false,
          hasCompletedResolveToday: false,
          isPremium: false,
          isAnonymous: onboardingState.anonymousMode,
        });
      }
    } catch (e) {
      console.log('Error fetching user profile:', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    if (error) throw error;
    return data;
  };

  const loginWithPhone = async (phone, pin) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const email = `${cleanPhone}@mab.app`;
    const internalPassword = `${pin}_mab`;
    return await login(email, internalPassword);
  };

  const signup = async (email, password) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: onboardingState.username || email.split('@')[0],
          avatar: onboardingState.avatar || 'batman',
        }
      }
    });
    setIsLoading(false);
    if (error) throw error;
    return data;
  };

  const signupWithPhone = async (phone, pin, securityQuestion, securityAnswer) => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const finalPin = pin || Math.floor(10000 + Math.random() * 90000).toString();
      const email = `${cleanPhone}@mab.app`;
      const internalPassword = `${finalPin}_mab`;

      // 1. Create auth user in Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: internalPassword,
        options: {
          data: {
            username: onboardingState.username || cleanPhone,
            avatar: onboardingState.avatar || 'batman',
          }
        }
      });
      if (signUpError) throw signUpError;
      if (!signUpData?.user) throw new Error('Failed to create account.');

      // 2. Call server-side complete_phone_signup RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc('complete_phone_signup', {
        p_user_id: signUpData.user.id,
        p_phone: cleanPhone,
        p_password: finalPin,
        p_security_question: securityQuestion,
        p_security_answer: securityAnswer,
        p_age_range: onboardingState.ageRange || null,
        p_interests: onboardingState.interests || null,
      });
      if (rpcError) throw rpcError;

      // 3. Immediately sign in to establish active session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: internalPassword,
      });
      if (signInError) throw signInError;

      setIsLoading(false);
      return { pin: finalPin, user: signInData.user };
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const fetchSecurityQuestion = async (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const { data, error } = await supabase.rpc('get_phone_security_question', {
      p_phone: cleanPhone,
    });
    if (error) throw error;
    return data;
  };

  const resetPasswordWithAnswer = async (phone, answer) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const { data, error } = await supabase.rpc('reset_phone_password', {
      p_phone: cleanPhone,
      p_answer: answer,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  const updateOnboarding = (data) => {
    setOnboardingState((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const completeOnboarding = () => {
    setOnboardingCompleted(true);
  };

  const toggleAnonymousMode = () => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isAnonymous: !prev.isAnonymous,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        onboardingCompleted,
        onboardingState,
        login,
        loginWithPhone,
        signup,
        signupWithPhone,
        fetchSecurityQuestion,
        resetPasswordWithAnswer,
        logout,
        updateOnboarding,
        completeOnboarding,
        toggleAnonymousMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
