import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Course, Category } from "@/types";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, BookOpen, Users, TrendingUp } from "lucide-react";

const ManageCourses = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    is_free: true,
    category_id: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    if (user && (profile?.role === 'pengajar' || profile?.role === 'admin')) {
      fetchData();
    }
  }, [user, profile]);

  const fetchData = async () => {
    try {
      // Fetch instructor's courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', user!.id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData as Course[] || []);

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
        description: "Gagal memuat data kursus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Judul kursus harus diisi",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const slug = formData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { error } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          slug,
          description: formData.description,
          price: formData.is_free ? 0 : formData.price,
          is_free: formData.is_free,
          category_id: formData.category_id || null,
          thumbnail_url: formData.thumbnail_url || null,
          instructor_id: user!.id,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Kursus berhasil dibuat",
      });

      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        price: 0,
        is_free: true,
        category_id: '',
        thumbnail_url: ''
      });
      fetchData();

    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Gagal membuat kursus",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      pending: "default",
      published: "default",
      rejected: "destructive"
    };
    
    const colors = {
      draft: "text-yellow-600",
      pending: "text-blue-600",
      published: "text-green-600",
      rejected: "text-red-600"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className={colors[status as keyof typeof colors]}>
        {status === 'draft' && 'Draft'}
        {status === 'pending' && 'Menunggu Review'}
        {status === 'published' && 'Dipublikasi'}
        {status === 'rejected' && 'Ditolak'}
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
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold">Kelola Kursus</h1>
            <p className="text-muted-foreground">Manage dan monitor kursus Anda</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buat Kursus Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Buat Kursus Baru</DialogTitle>
                <DialogDescription>
                  Isi informasi dasar untuk membuat kursus baru
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Judul Kursus</Label>
                  <Input
                    id="title"
                    placeholder="Masukkan judul kursus"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi singkat tentang kursus"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={formData.is_free}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      is_free: e.target.checked,
                      price: e.target.checked ? 0 : formData.price
                    })}
                  />
                  <Label htmlFor="is_free">Kursus Gratis</Label>
                </div>
                
                {!formData.is_free && (
                  <div className="grid gap-2">
                    <Label htmlFor="price">Harga (IDR)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Batal
                </Button>
                <Button onClick={createCourse} disabled={creating}>
                  {creating ? 'Membuat...' : 'Buat Kursus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Kursus</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.reduce((acc, course) => acc + (course.enrollments_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kursus Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter(course => course.status === 'published').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses List */}
        <div className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Belum Ada Kursus</h3>
                <p className="text-muted-foreground mb-4">
                  Mulai membuat kursus pertama Anda untuk berbagi pengetahuan
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Kursus Pertama
                </Button>
              </CardContent>
            </Card>
          ) : (
            courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        {getStatusBadge(course.status)}
                      </div>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrollments_count || 0} siswa</span>
                        </div>
                        <div>
                          {course.is_free ? (
                            <span className="text-green-600 font-medium">Gratis</span>
                          ) : (
                            <span className="font-medium">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR'
                              }).format(course.price)}
                            </span>
                          )}
                        </div>
                        <div>
                          Dibuat: {new Date(course.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;