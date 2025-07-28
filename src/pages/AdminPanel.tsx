import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Course, User as AppUser, Category } from "@/types";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  Plus,
  Check,
  X,
  Shield,
  User,
  GraduationCap
} from "lucide-react";

const AdminPanel = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    pendingCourses: 0
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch stats
      const [usersResult, coursesResult, enrollmentsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('enrollments').select('id', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalEnrollments: enrollmentsResult.count || 0,
        pendingCourses: 0
      });

      // Fetch pending courses
      const { data: pendingCourses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(pendingCourses as Course[] || []);
      setStats(prev => ({ ...prev, pendingCourses: pendingCourses?.length || 0 }));

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (usersError) throw usersError;
      setUsers((usersData as any[])?.map(u => ({ ...u, email: '' })) || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data admin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'published' })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Kursus berhasil disetujui",
      });

      fetchData();
    } catch (error) {
      console.error('Error approving course:', error);
      toast({
        title: "Error",
        description: "Gagal menyetujui kursus",
        variant: "destructive",
      });
    }
  };

  const rejectCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: 'rejected' })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Kursus Ditolak",
        description: "Kursus telah ditolak",
      });

      fetchData();
    } catch (error) {
      console.error('Error rejecting course:', error);
      toast({
        title: "Error",
        description: "Gagal menolak kursus",
        variant: "destructive",
      });
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Nama kategori harus diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = newCategory.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.name,
          slug,
          description: newCategory.description
        });

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Kategori berhasil dibuat",
      });

      setDialogOpen(false);
      setNewCategory({ name: '', description: '' });
      fetchData();

    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Gagal membuat kategori",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      pengajar: "default", 
      pelajar: "secondary"
    };

    const icons = {
      admin: <Shield className="h-3 w-3 mr-1" />,
      pengajar: <GraduationCap className="h-3 w-3 mr-1" />,
      pelajar: <User className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={variants[role as keyof typeof variants] as any} className="flex items-center">
        {icons[role as keyof typeof icons]}
        {role === 'admin' && 'Admin'}
        {role === 'pengajar' && 'Pengajar'}
        {role === 'pelajar' && 'Pelajar'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Kelola platform EduSpire</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingCourses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Review Kursus</TabsTrigger>
            <TabsTrigger value="users">Kelola Pengguna</TabsTrigger>
            <TabsTrigger value="categories">Kategori</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kursus Menunggu Review</CardTitle>
                <CardDescription>
                  Review dan setujui kursus yang dibuat oleh pengajar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Tidak ada kursus yang menunggu review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <p className="text-muted-foreground mt-1">
                              oleh {course.instructor?.full_name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {course.category && (
                                <Badge variant="outline">{course.category.name}</Badge>
                              )}
                              <span>
                                {course.is_free ? 'Gratis' : 
                                  new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR'
                                  }).format(course.price)
                                }
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              size="sm" 
                              onClick={() => approveCourse(course.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Setujui
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => rejectCourse(course.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Tolak
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pengguna</CardTitle>
                <CardDescription>
                  Kelola pengguna yang terdaftar di platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{user.full_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Bergabung {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kategori Kursus</CardTitle>
                  <CardDescription>
                    Kelola kategori untuk mengorganisir kursus
                  </CardDescription>
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tambah Kategori Baru</DialogTitle>
                      <DialogDescription>
                        Buat kategori baru untuk mengorganisir kursus
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nama Kategori</Label>
                        <Input
                          id="name"
                          placeholder="Masukkan nama kategori"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi</Label>
                        <Input
                          id="description"
                          placeholder="Deskripsi kategori (opsional)"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Batal
                      </Button>
                      <Button onClick={createCategory}>
                        Buat Kategori
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;