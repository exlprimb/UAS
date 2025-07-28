import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseModule, Lesson, Enrollment } from "@/types";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, PlayCircle, CheckCircle2, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const Learn = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug && user) {
      fetchCourseData();
    } else if (!user) {
      navigate('/auth');
    }
  }, [slug, user]);

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData as Course);

      // Check enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user!.id)
        .eq('course_id', courseData.id)
        .single();

      if (enrollmentError || !enrollmentData) {
        toast({
          title: "Akses Ditolak",
          description: "Anda belum terdaftar di kursus ini",
          variant: "destructive",
        });
        navigate(`/course/${slug}`);
        return;
      }

      setEnrollment(enrollmentData);

      // Fetch modules and lessons
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

      // Set first lesson as current if none selected
      if (modulesData && modulesData.length > 0 && modulesData[0].lessons && modulesData[0].lessons.length > 0) {
        setCurrentLesson(modulesData[0].lessons[0]);
      }

      // TODO: Fetch completed lessons from user progress table
      // For now, using mock data
      setCompletedLessons(new Set());

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kursus",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    if (!currentLesson || !enrollment) return;

    try {
      // Add to completed lessons
      const newCompleted = new Set(completedLessons);
      newCompleted.add(lessonId);
      setCompletedLessons(newCompleted);

      // Calculate new progress
      const totalLessons = modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0);
      const completedCount = newCompleted.size;
      const newProgress = (completedCount / totalLessons) * 100;

      // Update enrollment progress
      const { error } = await supabase
        .from('enrollments')
        .update({ progress: newProgress })
        .eq('id', enrollment.id);

      if (error) throw error;

      setEnrollment({ ...enrollment, progress: newProgress });

      toast({
        title: "Lesson Selesai!",
        description: `Progress Anda: ${Math.round(newProgress)}%`,
      });

      // Auto-advance to next lesson
      const nextLesson = getNextLesson();
      if (nextLesson) {
        setCurrentLesson(nextLesson);
      }

    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan progress",
        variant: "destructive",
      });
    }
  };

  const getNextLesson = (): Lesson | null => {
    if (!currentLesson) return null;

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.lessons) continue;

      const lessonIndex = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex !== -1) {
        // Try next lesson in same module
        if (lessonIndex + 1 < module.lessons.length) {
          return module.lessons[lessonIndex + 1];
        }
        // Try first lesson of next module
        if (i + 1 < modules.length && modules[i + 1].lessons && modules[i + 1].lessons!.length > 0) {
          return modules[i + 1].lessons![0];
        }
      }
    }
    return null;
  };

  const getPreviousLesson = (): Lesson | null => {
    if (!currentLesson) return null;

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (!module.lessons) continue;

      const lessonIndex = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex !== -1) {
        // Try previous lesson in same module
        if (lessonIndex > 0) {
          return module.lessons[lessonIndex - 1];
        }
        // Try last lesson of previous module
        if (i > 0 && modules[i - 1].lessons && modules[i - 1].lessons!.length > 0) {
          const prevModule = modules[i - 1];
          return prevModule.lessons![prevModule.lessons!.length - 1];
        }
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Kursus Tidak Ditemukan</h2>
              <p className="text-muted-foreground">Tidak dapat memuat konten kursus.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar - Course Content */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(enrollment?.progress || 0)}%</span>
                </div>
                <Progress value={enrollment?.progress || 0} className="h-2" />
              </div>
            </div>
            
            <Separator className="mb-4" />
            
            <div className="space-y-4">
              {modules.map((module) => (
                <div key={module.id}>
                  <h3 className="font-medium mb-2">{module.title}</h3>
                  <div className="space-y-1 ml-2">
                    {module.lessons?.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={cn(
                          "w-full text-left p-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                          currentLesson.id === lesson.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {completedLessons.has(lesson.id) ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <PlayCircle className="h-4 w-4" />
                        )}
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-xs opacity-70">
                          {lesson.duration_minutes}m
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black flex items-center justify-center">
            {currentLesson.video_url ? (
              <video
                src={currentLesson.video_url}
                controls
                className="max-w-full max-h-full"
                onEnded={() => {
                  if (!completedLessons.has(currentLesson.id)) {
                    markLessonComplete(currentLesson.id);
                  }
                }}
              />
            ) : (
              <div className="text-white text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Video tidak tersedia untuk lesson ini</p>
              </div>
            )}
          </div>

          {/* Lesson Info & Controls */}
          <div className="p-6 border-t bg-background">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentLesson.duration_minutes} menit</span>
                  </div>
                  {completedLessons.has(currentLesson.id) && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Selesai</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const prev = getPreviousLesson();
                    if (prev) setCurrentLesson(prev);
                  }}
                  disabled={!getPreviousLesson()}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                
                {!completedLessons.has(currentLesson.id) && (
                  <Button
                    size="sm"
                    onClick={() => markLessonComplete(currentLesson.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Tandai Selesai
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const next = getNextLesson();
                    if (next) setCurrentLesson(next);
                  }}
                  disabled={!getNextLesson()}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {currentLesson.content && (
              <div className="prose max-w-none">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="flex items-center gap-2 font-medium mb-2">
                    <BookOpen className="h-4 w-4" />
                    Materi Pembelajaran
                  </h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {currentLesson.content}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;