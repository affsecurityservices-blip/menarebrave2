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
        signup,
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
