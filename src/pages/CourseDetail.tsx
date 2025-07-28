import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseModule, Enrollment } from "@/types";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Clock, Star, Users, Play } from "lucide-react";

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCourse();
    }
  }, [slug, user]);

  const fetchCourse = async () => {
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (courseError) throw courseError;

      // Fetch instructor and category separately
      const [instructorResult, categoryResult] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('user_id', courseData.instructor_id).single(),
        courseData.category_id ? supabase.from('categories').select('name').eq('id', courseData.category_id).single() : Promise.resolve({ data: null })
      ]);

      const enrichedCourse = {
        ...courseData,
        instructor: instructorResult.data,
        category: categoryResult.data
      };

      setCourse(enrichedCourse as Course);

      // Fetch course modules and lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          lessons(*)
        `)
        .eq('course_id', courseData.id)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Check enrollment status if user is logged in
      if (user && courseData.id) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseData.id)
          .single();
        
        setEnrollment(enrollmentData);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast({
        title: "Error",
        description: "Gagal memuat detail kursus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
        });

      if (error) throw error;

      toast({
        title: "Berhasil!",
        description: "Anda berhasil mendaftar ke kursus ini",
      });

      // Refresh enrollment status
      fetchCourse();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: "Gagal mendaftar ke kursus",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Kursus Tidak Ditemukan</h2>
              <p className="text-muted-foreground">Kursus yang Anda cari tidak tersedia atau telah dihapus.</p>
              <Button onClick={() => navigate('/courses')} className="mt-4">
                Kembali ke Katalog
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {course.category && (
                  <Badge variant="secondary">{course.category.name}</Badge>
                )}
                {course.is_free && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Gratis
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollments_count || 0} siswa</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (125 ulasan)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>12 jam</span>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Course Content Tabs */}
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
                <TabsTrigger value="instructor">Instruktur</TabsTrigger>
                <TabsTrigger value="reviews">Ulasan</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curriculum" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Konten Kursus</CardTitle>
                    <CardDescription>
                      {modules.length} modul • {modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)} pelajaran
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {modules.map((module, index) => (
                        <AccordionItem key={module.id} value={`module-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div>
                              <h4 className="font-medium">{module.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {module.lessons?.length || 0} pelajaran
                              </p>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {module.lessons?.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-2">
                                    <Play className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{lesson.title}</span>
                                    {lesson.is_preview && (
                                      <Badge variant="outline" className="text-xs">Preview</Badge>
                                    )}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {lesson.duration_minutes} menit
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>Tentang Instruktur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {course.instructor?.full_name?.charAt(0) || 'I'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{course.instructor?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">Instruktur Profesional</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Instruktur berpengalaman dengan keahlian di bidang teknologi dan pendidikan.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Ulasan Siswa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Belum ada ulasan untuk kursus ini.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold mb-2">
                    {course.is_free ? 'Gratis' : formatPrice(course.price)}
                  </div>
                  {!course.is_free && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatPrice(course.price * 1.5)}
                    </p>
                  )}
                </div>

                {enrollment ? (
                  <div className="space-y-4">
                    <Badge variant="default" className="w-full justify-center py-2">
                      Sudah Terdaftar
                    </Badge>
                    <Button className="w-full" onClick={() => navigate(`/learn/${course.slug}`)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Lanjutkan Belajar
                    </Button>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Progress: {Math.round(enrollment.progress)}%
                      </p>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Mendaftar...' : 'Daftar Sekarang'}
                  </Button>
                )}

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Akses seumur hidup</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sertifikat penyelesaian</span>
                    <span>✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Akses mobile</span>
                    <span>✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik Kursus</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tingkat</span>
                  <Badge variant="outline">Pemula</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bahasa</span>
                  <span className="text-sm">Bahasa Indonesia</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Update terakhir</span>
                  <span className="text-sm">
                    {new Date(course.updated_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;