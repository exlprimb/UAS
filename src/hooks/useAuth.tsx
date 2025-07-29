import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as AppUser } from '@/types'; // Menggunakan tipe AppUser dari types/index.ts
import apiClient from '@/lib/axios';

// Tipe untuk data user yang diterima dari Laravel
interface LaravelUser {
  id: number;
  name: string;
  email: string;
  profile: AppUser; // Relasi profile
}

interface AuthContextType {
  user: LaravelUser | null;
  profile: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;

}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LaravelUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data user saat aplikasi dimuat
  useEffect(() => {
    const fetchUserOnLoad = async () => {
      try {
        const { data } = await apiClient.get('/api/user');
        setUser(data);
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.log('User not authenticated');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOnLoad();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await apiClient.get('/sanctum/csrf-cookie');
      const { data } = await apiClient.post('/register', {
        name: fullName,
        email,
        password,
        password_confirmation: password,
      });
      setUser(data);
      if (data.profile) {
        setProfile(data.profile);
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || { message: 'Registration failed' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await apiClient.get('/sanctum/csrf-cookie');
      const { data } = await apiClient.post('/login', { email, password });
      setUser(data);
      if (data.profile) {
        setProfile(data.profile);
      }
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || { message: 'Login failed' } };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
