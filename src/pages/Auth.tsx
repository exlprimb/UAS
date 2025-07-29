import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Mail, Lock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Login Gagal",
              description: "Email atau password tidak valid.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Gagal",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Login Berhasil",
            description: "Selamat datang kembali!",
          });
          navigate('/dashboard');
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: "Registrasi Gagal",
            description: "Nama lengkap harus diisi.",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: "Registrasi Gagal",
              description: "Email sudah terdaftar. Silakan gunakan email lain atau login.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registrasi Gagal",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Registrasi Berhasil",
            description: "Silakan cek email Anda untuk konfirmasi.",
          });
          setIsLogin(true);
        }
      }
    } catch (error) {
      toast({
        title: "Terjadi Kesalahan",
        description: "Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-medium">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">Web Learning Hub</span>
          </Link>
          <p className="text-white/80 mt-2">Platform pembelajaran online terbaik</p>
        </div>

        <Card className="p-8 shadow-strong bg-white/95 backdrop-blur-sm border-0">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? 'Lanjutkan perjalanan belajar Anda' 
                : 'Mulai perjalanan belajar yang menakjubkan'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="hero"
              disabled={loading}
            >
              {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary"
            >
              {isLogin 
                ? 'Belum punya akun? Daftar di sini' 
                : 'Sudah punya akun? Masuk di sini'}
            </Button>
          </div>

          <div className="text-center mt-4">
            <Button variant="ghost" asChild>
              <Link to="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}