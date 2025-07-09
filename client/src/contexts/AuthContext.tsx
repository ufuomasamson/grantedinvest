import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider initializing');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const checkAdminStatus = async (currentUser: User | null) => {
    if (!currentUser) {
      console.log('checkAdminStatus: No user, setting isAdmin to false');
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }

    setAdminLoading(true);
    try {
      console.log('checkAdminStatus: Checking admin status for user:', currentUser.email, 'ID:', currentUser.id);

      // Check if user email is admin first (fastest method)
      const adminEmails = ['okoroufuoma000@gmail.com']; // Add your admin emails here
      let isAdminUser = adminEmails.includes(currentUser.email || '');

      if (isAdminUser) {
        console.log('checkAdminStatus: User is admin by email');
        setIsAdmin(true);
        setAdminLoading(false);
        return;
      }

      // If not admin by email, try database check with timeout
      try {
        const profilePromise = supabaseAdmin
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Admin check timeout')), 3000)
        );

        const { data: profile, error: profileError } = await Promise.race([profilePromise, timeoutPromise]);

        console.log('checkAdminStatus: Database query result:', { profile, profileError });

        if (!profileError && profile?.role === 'admin') {
          isAdminUser = true;
        }
      } catch (dbError) {
        console.log('checkAdminStatus: Database check failed:', dbError);
        // If database fails, stick with email-based check result
      }

      setIsAdmin(isAdminUser);
      console.log('checkAdminStatus: Final admin status:', isAdminUser);
    } catch (error) {
      console.error('checkAdminStatus: Error:', error);
      // If everything fails, check email one more time
      const adminEmails = ['okoroufuoma000@gmail.com'];
      const isAdminByEmail = adminEmails.includes(currentUser.email || '');
      setIsAdmin(isAdminByEmail);
      console.log('checkAdminStatus: Fallback to email check:', isAdminByEmail);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Starting initialization');
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Getting session');

        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (!mounted) {
          console.log('AuthProvider: Component unmounted, skipping state updates');
          return;
        }

        if (session?.user) {
          console.log('AuthProvider: Found existing session for user:', session.user.email);
          setUser(session.user);
          await checkAdminStatus(session.user);
        } else {
          console.log('AuthProvider: No existing session found');
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (mounted) {
          console.log('AuthProvider: Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Add a fallback timeout to ensure loading never stays true forever
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('AuthProvider: Fallback timeout triggered, forcing loading to false');
        setLoading(false);
        // Don't clear user state on timeout, just stop loading
      }
    }, 10000); // 10 second fallback

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) {
        console.log('AuthProvider: Auth state change ignored - component unmounted');
        return;
      }

      console.log('AuthProvider: Auth state changed:', event, session?.user?.email);

      try {
        if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out');
          setUser(null);
          setIsAdmin(false);
          setAdminLoading(false);
          setLoading(false);
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthProvider: User signed in');
          setUser(session.user);
          // Start admin check in background, don't await
          checkAdminStatus(session.user).catch(err => {
            console.error('Admin check failed in auth state change:', err);
          });
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('AuthProvider: Token refreshed, maintaining current state');
          // Don't change anything on token refresh
        } else if (session?.user) {
          console.log('AuthProvider: User session found/updated');
          setUser(session.user);
          // Only check admin status if we don't already have it
          if (!isAdmin) {
            checkAdminStatus(session.user).catch(err => {
              console.error('Admin check failed:', err);
            });
          }
          setLoading(false);
        } else {
          console.log('AuthProvider: No session, clearing user state');
          setUser(null);
          setIsAdmin(false);
          setAdminLoading(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error in auth state change:', error);
        // Don't clear user state on errors, just ensure loading is false
        setLoading(false);
      }
    });

    return () => {
      console.log('AuthProvider: Cleanup - unsubscribing and marking as unmounted');
      mounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, []);

  console.log('AuthProvider rendering', {
    user: user?.email,
    loading,
    isAdmin,
    timestamp: new Date().toISOString()
  });

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting to sign in with email:', email);
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful, user data:', data.user);

      if (data.user) {
        setUser(data.user);
        // Don't await admin check here - let it happen in background
        checkAdminStatus(data.user).catch(err => {
          console.error('Admin check failed during sign in:', err);
        });
        console.log('User set successfully, admin status check started');
      }
    } catch (error) {
      console.error('Login process error:', error);
      throw error;
    } finally {
      // Set loading to false immediately after sign in
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;

      console.log('Sign up successful:', data.user?.email);
      // Note: User will need to confirm email before they can sign in
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setIsAdmin(false);
      setAdminLoading(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshAdminStatus = async () => {
    if (user) {
      console.log('Manually refreshing admin status for:', user.email);
      await checkAdminStatus(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, adminLoading, signIn, signUp, signOut, refreshAdminStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 