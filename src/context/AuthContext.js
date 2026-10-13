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
          country: data.country || 'India',
          countryCode: data.country_code || '+91',
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
          country: 'India',
          countryCode: '+91',
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

  const loginWithPhone = async (phone, pin, dialCode = '+91') => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanDial = (dialCode || '').replace(/[^0-9]/g, '');
      const internalPassword = `${pin}_mab`;

      // Try with dialCode prefix first (E.164 standard)
      const fullCleanPhone = cleanDial ? `${cleanDial}${cleanPhone}` : cleanPhone;
      const primaryEmail = `${fullCleanPhone}@mab.app`;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: primaryEmail,
          password: internalPassword,
        });
        if (error) throw error;
        setIsLoading(false);
        return data;
      } catch (firstErr) {
        // If login failed and dialCode was attached, also try legacy email format without dialCode
        if (cleanDial) {
          const legacyEmail = `${cleanPhone}@mab.app`;
          const { data, error: legacyErr } = await supabase.auth.signInWithPassword({
            email: legacyEmail,
            password: internalPassword,
          });
          if (!legacyErr) {
            setIsLoading(false);
            return data;
          }
        }
        throw firstErr;
      }
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
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

  const signupWithPhone = async (phone, pin, securityQuestion, securityAnswer, country = 'India', countryCode = '+91') => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanDial = (countryCode || '').replace(/[^0-9]/g, '');
      const finalPin = pin || Math.floor(10000 + Math.random() * 90000).toString();

      // Combined phone for storage and auth email
      const fullPhoneDisplay = `${countryCode} ${cleanPhone}`.trim();
      const fullCleanPhone = cleanDial ? `${cleanDial}${cleanPhone}` : cleanPhone;
      const email = `${fullCleanPhone}@mab.app`;
      const internalPassword = `${finalPin}_mab`;

      // 1. Create auth user in Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: internalPassword,
        options: {
          data: {
            username: onboardingState.username || cleanPhone,
            avatar: onboardingState.avatar || 'batman',
            country: country,
            country_code: countryCode,
          }
        }
      });
      if (signUpError) throw signUpError;
      if (!signUpData?.user) throw new Error('Failed to create account.');

      // 2. Call server-side complete_phone_signup RPC with country and country_code
      const { data: rpcData, error: rpcError } = await supabase.rpc('complete_phone_signup', {
        p_user_id: signUpData.user.id,
        p_phone: fullPhoneDisplay,
        p_password: finalPin,
        p_security_question: securityQuestion,
        p_security_answer: securityAnswer,
        p_age_range: onboardingState.ageRange || null,
        p_interests: onboardingState.interests || null,
        p_country: country,
        p_country_code: countryCode,
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

  const fetchSecurityQuestion = async (phone, dialCode = '') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanDial = (dialCode || '').replace(/[^0-9]/g, '');
    const fullPhone = cleanDial ? `${cleanDial}${cleanPhone}` : cleanPhone;

    let res = await supabase.rpc('get_phone_security_question', {
      p_phone: fullPhone,
    });
    if ((res.error || !res.data?.success) && cleanDial) {
      // Fallback try with local cleanPhone
      const fallbackRes = await supabase.rpc('get_phone_security_question', {
        p_phone: cleanPhone,
      });
      if (fallbackRes?.data?.success) return fallbackRes.data;
    }
    if (res.error) throw res.error;
    return res.data;
  };

  const resetPasswordWithAnswer = async (phone, answer, dialCode = '') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanDial = (dialCode || '').replace(/[^0-9]/g, '');
    const fullPhone = cleanDial ? `${cleanDial}${cleanPhone}` : cleanPhone;

    let res = await supabase.rpc('reset_phone_password', {
      p_phone: fullPhone,
      p_answer: answer,
    });
    if ((res.error || !res.data?.success) && cleanDial) {
      const fallbackRes = await supabase.rpc('reset_phone_password', {
        p_phone: cleanPhone,
        p_answer: answer,
      });
      if (fallbackRes?.data?.success) return fallbackRes.data;
    }
    if (res.error) throw res.error;
    return res.data;
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
