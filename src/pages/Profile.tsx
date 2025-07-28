import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Save, X, Shield, GraduationCap, BookOpen } from "lucide-react";

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || ''
  });

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      toast({
        title: "Error",
        description: "Nama lengkap harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        bio: formData.bio
      });

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Profil berhasil diperbarui",
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      bio: profile?.bio || ''
    });
    setIsEditing(false);
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          icon: <Shield className="h-4 w-4" />,
          label: 'Administrator',
          description: 'Akses penuh ke semua fitur platform',
          variant: 'destructive' as const
        };
      case 'pengajar':
        return {
          icon: <GraduationCap className="h-4 w-4" />,
          label: 'Pengajar',
          description: 'Dapat membuat dan mengelola kursus',
          variant: 'default' as const
        };
      case 'pelajar':
        return {
          icon: <BookOpen className="h-4 w-4" />,
          label: 'Pelajar',
          description: 'Dapat mengikuti kursus yang tersedia',
          variant: 'secondary' as const
        };
      default:
        return {
          icon: <User className="h-4 w-4" />,
          label: 'Pengguna',
          description: 'Pengguna platform',
          variant: 'secondary' as const
        };
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Profil Tidak Ditemukan</h2>
              <p className="text-muted-foreground">Silakan login untuk melihat profil Anda.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(profile.role);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Profil Saya</h1>
            <p className="text-muted-foreground">Kelola informasi profil Anda</p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-primary">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge variant={roleInfo.variant} className="flex items-center gap-1">
                  {roleInfo.icon}
                  {roleInfo.label}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <>
                  {/* View Mode */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-lg">{user.email}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nama Lengkap</Label>
                      <p className="text-lg">{profile.full_name}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                      <p className="text-lg">{roleInfo.label}</p>
                      <p className="text-sm text-muted-foreground">{roleInfo.description}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                      <p className="text-lg">
                        {profile.bio || 'Belum ada bio yang ditambahkan'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bergabung Sejak</Label>
                      <p className="text-lg">
                        {new Date(profile.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profil
                  </Button>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email tidak dapat diubah
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="full_name">Nama Lengkap</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Ceritakan sedikit tentang diri Anda"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave} 
                      disabled={loading}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Batal
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ID Pengguna</span>
                <span className="text-sm font-mono">{user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Terakhir Diperbarui</span>
                <span className="text-sm">
                  {new Date(profile.updated_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;