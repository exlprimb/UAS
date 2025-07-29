import React, { createContext, useContext, useEffect, useState } from 'react';
// Hapus import User dan Session dari Supabase
import { User as AppUser } from '@/types';
import apiClient from '@/lib/axios'; // Gunakan instance Axios yang sudah kita buat

// Definisikan tipe User dari Laravel (sesuaikan jika perlu)
// Biasanya hanya butuh beberapa properti utama di frontend
interface LaravelUser {
  id: number;
  email: string;
  // Tambahkan properti lain yang dikirim dari backend Laravel Anda
  [key: string]: any;
}

interface AuthContextType {
  user: LaravelUser | null;
  profile: AppUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: any }>;
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

  // GANTI TOTAL: useEffect sekarang hanya mengecek sesi ke backend Laravel
  useEffect(() => {
    const fetchUserOnLoad = async () => {
      try {
        const { data } = await apiClient.get('/api/user');
        setUser(data);
        if (data.profile) { // Asumsi backend menyertakan relasi profile
          setProfile(data.profile);
        }
      } catch (error) {
        console.log('User not authenticated');
        // Pastikan user dan profile null jika tidak ada sesi
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOnLoad();
  }, []);

  // BARU: Fungsi signUp untuk Laravel
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await apiClient.get('/sanctum/csrf-cookie');
      await apiClient.post('/register', { 
        name: fullName, // Sesuaikan dengan nama field di backend
        email, 
        password,
        password_confirmation: password // Laravel biasanya butuh ini
      });
      // Setelah register, Anda bisa otomatis login atau minta user login manual
      await signIn(email, password);
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data || { message: 'Registration failed' } };
    }
  };

  // BENAR: Fungsi signIn untuk Laravel
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

  // BARU: Fungsi signOut untuk Laravel
  const signOut = async () => {
    try {
      await apiClient.post('/logout');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Selalu hapus state di frontend apapun hasilnya
      setUser(null);
      setProfile(null);
    }
  };

  // BARU: Fungsi updateProfile untuk Laravel
  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
        // Asumsi Anda punya endpoint PUT/PATCH di /api/user/profile
        const { data } = await apiClient.put('/api/user/profile', updates);
        setProfile(data); // Update profile dengan data baru dari server
        return { error: null };
    } catch (error: any) {
        return { error: error.response?.data || { message: 'Update failed' } };
    }
  };

  // Hapus state 'session' karena tidak lagi relevan
  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
