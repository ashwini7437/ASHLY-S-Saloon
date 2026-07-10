import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '../supabaseClient';

const AuthContext = createContext({});

const isNetworkError = (err) => {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('connection') ||
    err.status === 0 ||
    err.status === 502 ||
    err.status === 503 ||
    err.status === 504 ||
    err.name === 'TypeError'
  );
};

const initSandbox = () => {
  const existing = localStorage.getItem('ashly_sandbox_users');
  if (!existing) {
    const defaultUsers = [
      {
        id: 'mock-admin-id',
        email: 'admin@ashlysaloon.com',
        password: 'adminpassword',
        name: 'Admin Tester',
        phone: '9876543210',
        role: 'admin'
      },
      {
        id: 'mock-customer-id',
        email: 'customer@ashlysaloon.com',
        password: 'customerpassword',
        name: 'Customer Tester',
        phone: '9876543210',
        role: 'customer'
      }
    ];
    localStorage.setItem('ashly_sandbox_users', JSON.stringify(defaultUsers));
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setProfile(data);
      setRole(data?.role || 'customer');
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If we are in local sandbox mode, profile is already loaded
      const active = localStorage.getItem('ashly_current_session');
      if (active) {
        const u = JSON.parse(active);
        setProfile(u);
        setRole(u.role);
      } else {
        setProfile(null);
        setRole(null);
      }
    }
  };

  useEffect(() => {
    initSandbox();
    
    const checkSessionStatus = async () => {
      const isOnline = await checkSupabaseConnection();
      if (!isOnline) {
        // Switch to offline sandbox session instantly
        const active = localStorage.getItem('ashly_current_session');
        if (active) {
          const u = JSON.parse(active);
          setUser({ id: u.id, email: u.email });
          setProfile(u);
          setRole(u.role);
        }
        setLoading(false);
        return;
      }

      // If online, check Supabase session standard way
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (e) {
        console.warn("Offline auth fallback initiated");
      } finally {
        setLoading(false);
      }
    };

    checkSessionStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        fetchProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        if (!localStorage.getItem('ashly_current_session')) {
          setProfile(null);
          setRole(null);
        }
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      localStorage.removeItem('ashly_current_session'); // Clean up sandbox session
      return data;
    } catch (err) {
      if (isNetworkError(err)) {
        initSandbox();
        const users = JSON.parse(localStorage.getItem('ashly_sandbox_users') || '[]');
        const found = users.find(u => u.email === email && u.password === password);
        if (found) {
          const sessionUser = { id: found.id, email: found.email };
          setUser(sessionUser);
          setProfile(found);
          setRole(found.role);
          localStorage.setItem('ashly_current_session', JSON.stringify(found));
          setLoading(false);
          return { user: sessionUser };
        } else {
          setLoading(false);
          throw new Error('Invalid credentials. For sandbox testing, use: admin@ashlysaloon.com / adminpassword');
        }
      }
      setLoading(false);
      throw err;
    }
  };

  const register = async (email, password, name, phone, role = 'customer') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role
          }
        }
      });
      if (error) throw error;
      return data;
    } catch (err) {
      if (isNetworkError(err)) {
        initSandbox();
        const users = JSON.parse(localStorage.getItem('ashly_sandbox_users') || '[]');
        if (users.find(u => u.email === email)) {
          setLoading(false);
          throw new Error('User already exists in sandbox');
        }
        const newUser = {
          id: 'mock-' + Date.now(),
          email,
          password,
          name,
          phone,
          role
        };
        const updated = [...users, newUser];
        localStorage.setItem('ashly_sandbox_users', JSON.stringify(updated));
        setLoading(false);
        return { user: { id: newUser.id, email: newUser.email } };
      }
      setLoading(false);
      throw err;
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      if (isNetworkError(err)) {
        return { message: 'Sandbox reset email simulated successfully.' };
      }
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Offline logout cleanup");
    } finally {
      localStorage.removeItem('ashly_current_session');
      setUser(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, login, register, resetPassword, logout, refreshProfile: () => fetchProfile(user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
