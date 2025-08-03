import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account."
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error || !data.user) {
        toast({
          title: "Error",
          description: error?.message || "Login failed",
          variant: "destructive"
        });
        return { user: null, error };
      }

      toast({
        title: "Success",
        description: "Signed in successfully!"
      });

      return { user: data.user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { user: null, error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "Success",
        description: "Signed out successfully!"
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: { message: errorMessage } };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };
}
