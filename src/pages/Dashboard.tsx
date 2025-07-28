import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Users,
  Settings,
  PlusCircle,
  Eye
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  const mockStats = {
    pelajar: {
      enrolledCourses: 5,
      completedCourses: 2,
      totalLearningHours: 45,
      certificatesEarned: 2,
    },
    pengajar: {
      totalCourses: 8,
      totalStudents: 342,
      totalRevenue: 15750000,
      avgRating: 4.8,
    },
    admin: {
      totalUsers: 25000,
      totalCourses: 500,
      pendingApprovals: 12,
      monthlyRevenue: 125000000,
    }
  };

  const mockEnrolledCourses = [
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop',
      progress: 75,
      instructor: 'John Doe',
      nextLesson: 'ES6 Arrow Functions',
    },
    {
      id: '2',
      title: 'React Development',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
      progress: 40,
      instructor: 'Jane Smith',
      nextLesson: 'State Management',
    },
  ];

  const mockCreatedCourses = [
    {
      id: '1',
      title: 'Advanced JavaScript Patterns',
      status: 'published',
      students: 156,
      revenue: 4680000,
      rating: 4.9,
    },
    {
      id: '2',
      title: 'Node.js Backend Development',
      status: 'pending',
      students: 0,
      revenue: 0,
      rating: 0,
    },
  ];

  const renderPelajarDashboard = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pelajar.enrolledCourses}</p>
              <p className="text-muted-foreground text-sm">Kursus Diikuti</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-success" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pelajar.completedCourses}</p>
              <p className="text-muted-foreground text-sm">Kursus Selesai</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-8 h-8 text-warning" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pelajar.totalLearningHours}</p>
              <p className="text-muted-foreground text-sm">Jam Belajar</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pelajar.certificatesEarned}</p>
              <p className="text-muted-foreground text-sm">Sertifikat</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Kursus */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Kursus yang Sedang Diikuti</h2>
        <div className="space-y-4">
          {mockEnrolledCourses.map((course) => (
            <div key={course.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground">Pengajar: {course.instructor}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress: {course.progress}%</span>
                    <span>Selanjutnya: {course.nextLesson}</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              </div>
              <Button variant="default">Lanjutkan</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPengajarDashboard = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pengajar.totalCourses}</p>
              <p className="text-muted-foreground text-sm">Total Kursus</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-success" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pengajar.totalStudents}</p>
              <p className="text-muted-foreground text-sm">Total Pelajar</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-warning" />
            <div>
              <p className="text-2xl font-bold">Rp {(mockStats.pengajar.totalRevenue / 1000000).toFixed(1)}M</p>
              <p className="text-muted-foreground text-sm">Total Pendapatan</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">{mockStats.pengajar.avgRating}</p>
              <p className="text-muted-foreground text-sm">Rating Rata-rata</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button size="lg" variant="default" className="h-auto p-6" asChild>
            <Link to="/instructor/courses/new">
              <div className="text-center">
                <PlusCircle className="w-8 h-8 mx-auto mb-2" />
                <span>Buat Kursus Baru</span>
              </div>
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-auto p-6" asChild>
            <Link to="/instructor/courses">
              <div className="text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <span>Kelola Kursus</span>
              </div>
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-auto p-6" asChild>
            <Link to="/instructor/analytics">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <span>Lihat Analitik</span>
              </div>
            </Link>
          </Button>
        </div>
      </Card>

      {/* Kursus yang Dibuat */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Kursus Anda</h2>
        <div className="space-y-4">
          {mockCreatedCourses.map((course) => (
            <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h3 className="font-semibold">{course.title}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge variant={course.status === 'published' ? 'default' : 'outline'}>
                    {course.status === 'published' ? 'Dipublikasi' : 'Pending'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {course.students} pelajar
                  </span>
                  {course.status === 'published' && (
                    <span className="text-sm text-muted-foreground">
                      ⭐ {course.rating}/5
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/instructor/courses/${course.id}`}>
                    <Settings className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/courses/${course.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Lihat
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{(mockStats.admin.totalUsers / 1000).toFixed(0)}K</p>
              <p className="text-muted-foreground text-sm">Total Pengguna</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-success" />
            <div>
              <p className="text-2xl font-bold">{mockStats.admin.totalCourses}</p>
              <p className="text-muted-foreground text-sm">Total Kursus</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-8 h-8 text-warning" />
            <div>
              <p className="text-2xl font-bold">{mockStats.admin.pendingApprovals}</p>
              <p className="text-muted-foreground text-sm">Pending Approval</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-2xl font-bold">Rp {(mockStats.admin.monthlyRevenue / 1000000).toFixed(0)}M</p>
              <p className="text-muted-foreground text-sm">Pendapatan Bulan Ini</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Panel Admin</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button size="lg" variant="default" className="h-auto p-6" asChild>
            <Link to="/admin/courses">
              <div className="text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <span>Kelola Kursus</span>
              </div>
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-auto p-6" asChild>
            <Link to="/admin/users">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <span>Kelola Pengguna</span>
              </div>
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-auto p-6" asChild>
            <Link to="/admin/approvals">
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <span>Approval Kursus</span>
              </div>
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-auto p-6" asChild>
            <Link to="/admin/analytics">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <span>Analitik</span>
              </div>
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Selamat datang, {profile.full_name}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            {profile.role === 'admin' && 'Kelola platform edukasi dengan panel admin yang lengkap.'}
            {profile.role === 'pengajar' && 'Pantau kursus Anda dan berinteraksi dengan pelajar.'}
            {profile.role === 'pelajar' && 'Lanjutkan perjalanan belajar Anda hari ini.'}
          </p>
        </div>

        {profile.role === 'pelajar' && renderPelajarDashboard()}
        {profile.role === 'pengajar' && renderPengajarDashboard()}
        {profile.role === 'admin' && renderAdminDashboard()}
      </div>
    </div>
  );
}