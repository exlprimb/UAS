import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'pengajar' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!profile || profile.role !== role) {
        console.warn(`Akses ditolak. Peran yang dibutuhkan: ${role}, peran pengguna: ${profile?.role}`);
        // Arahkan ke halaman dashboard atau halaman lain jika tidak berhak
        navigate('/dashboard', { replace: true });
      }
    }
  }, [profile, loading, role, navigate]);

  // Tampilkan loading state saat memeriksa otentikasi
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Memeriksa otorisasi...</div>
      </div>
    );
  }

  // Jika otorisasi berhasil, tampilkan komponen anak
  if (profile && profile.role === role) {
    return <>{children}</>;
  }

  // Fallback jika terjadi kondisi yang tidak terduga
  return null;
};

export default ProtectedRoute;
