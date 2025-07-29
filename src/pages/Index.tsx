import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { CourseCard } from '@/components/CourseCard';
import { useAuth } from '@/hooks/useAuth';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Star,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Globe,
  Code,
  Palette,
  Atom
} from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-education.jpg';

// Mock data - in real app this would come from API
const mockCourses = [
  {
    id: '1',
    title: 'JavaScript Fundamentals untuk Pemula',
    slug: 'javascript-fundamentals',
    description: 'Pelajari dasar-dasar JavaScript dari nol hingga mahir. Cocok untuk pemula yang ingin memulai karir sebagai web developer.',
    thumbnail_url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop',
    price: 299000,
    is_free: false,
    status: 'published' as const,
    instructor_id: '1',
    category: { id: '1', name: 'Programming', slug: 'programming', icon: 'Code', created_at: '' },
    instructor: { id: '1', email: '', full_name: 'John Doe', role: 'pengajar' as const, created_at: '', updated_at: '' },
    enrollments_count: 1250,
    is_enrolled: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    title: 'UI/UX Design dengan Figma',
    slug: 'uiux-design-figma',
    description: 'Kuasai design UI/UX modern dengan tools Figma. Dari wireframe hingga prototype yang interaktif.',
    thumbnail_url: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=400&h=300&fit=crop',
    price: 399000,
    is_free: false,
    status: 'published' as const,
    instructor_id: '2',
    category: { id: '2', name: 'Design', slug: 'design', icon: 'Palette', created_at: '' },
    instructor: { id: '2', email: '', full_name: 'Jane Smith', role: 'pengajar' as const, created_at: '', updated_at: '' },
    enrollments_count: 890,
    is_enrolled: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    title: 'React Development Masterclass',
    slug: 'react-development',
    description: 'Belajar React dari dasar hingga advanced. Termasuk hooks, context API, dan best practices modern.',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    price: 0,
    is_free: true,
    status: 'published' as const,
    instructor_id: '1',
    category: { id: '1', name: 'Programming', slug: 'programming', icon: 'Code', created_at: '' },
    instructor: { id: '1', email: '', full_name: 'John Doe', role: 'pengajar' as const, created_at: '', updated_at: '' },
    enrollments_count: 2340,
    is_enrolled: false,
    created_at: '',
    updated_at: '',
  },
];

const categories = [
  { name: 'Programming', icon: Code, count: 45, color: 'bg-blue-500' },
  { name: 'Design', icon: Palette, count: 32, color: 'bg-purple-500' },
  { name: 'Business', icon: TrendingUp, count: 28, color: 'bg-green-500' },
  { name: 'Language', icon: Globe, count: 19, color: 'bg-orange-500' },
  { name: 'Science', icon: Atom, count: 15, color: 'bg-red-500' },
];

const stats = [
  { label: 'Total Kursus', value: '500+', icon: BookOpen },
  { label: 'Pengajar Ahli', value: '150+', icon: Users },
  { label: 'Pelajar Aktif', value: '25,000+', icon: GraduationCap },
  { label: 'Rating Rata-rata', value: '4.8/5', icon: Star },
];

const features = [
  {
    icon: PlayCircle,
    title: 'Video Berkualitas HD',
    description: 'Materi pembelajaran dalam format video HD dengan kualitas audio yang jernih.'
  },
  {
    icon: CheckCircle,
    title: 'Sertifikat Resmi',
    description: 'Dapatkan sertifikat yang diakui industri setelah menyelesaikan kursus.'
  },
  {
    icon: Users,
    title: 'Diskusi Interaktif',
    description: 'Bergabung dengan komunitas pembelajar dan diskusi dengan pengajar.'
  },
  {
    icon: Award,
    title: 'Pengajar Berpengalaman',
    description: 'Belajar dari praktisi industri dengan pengalaman puluhan tahun.'
  },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero"></div>
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Education" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Wujudkan Impian Karir 
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Melalui Pembelajaran
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Platform pembelajaran online terdepan dengan ribuan kursus berkualitas tinggi, 
              pengajar ahli, dan sertifikat yang diakui industri.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="xl" variant="hero" asChild>
                <Link to="/courses">
                  Jelajahi Kursus
                  <BookOpen className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              {!user && (
                <Button size="xl" variant="premium" asChild>
                  <Link to="/auth">
                    Mulai Gratis
                    <GraduationCap className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-primary rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kursus Populer</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pilihan kursus terbaik yang telah dipercaya ribuan pelajar untuk mengembangkan karir mereka.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockCourses.map((course) => (
              <CourseCard key={course.id} course={course} isPreview={!user} />
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link to="/courses">Lihat Semua Kursus</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kategori Populer</h2>
            <p className="text-xl text-muted-foreground">
              Temukan kursus sesuai dengan minat dan tujuan karir Anda
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-medium transition-all duration-300 hover:scale-105 cursor-pointer group">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${category.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-muted-foreground text-sm">{category.count} Kursus</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mengapa Memilih Web Learning Hub?</h2>
            <p className="text-xl text-muted-foreground">
              Platform pembelajaran yang dirancang untuk kesuksesan Anda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Siap Memulai Perjalanan Belajar?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Bergabunglah dengan ribuan pelajar yang telah mengubah hidup mereka melalui Web Learning Hub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="premium" asChild>
              <Link to={user ? "/courses" : "/auth"}>
                {user ? "Mulai Belajar Sekarang" : "Daftar Gratis Sekarang"}
                <GraduationCap className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Web Learning Hub</span>
              </div>
              <p className="text-muted-foreground">
                Platform pembelajaran online terdepan untuk mengembangkan karir dan keterampilan Anda.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Kursus</h3>
              <div className="space-y-2 text-muted-foreground">
                <div>Programming</div>
                <div>Design</div>
                <div>Business</div>
                <div>Marketing</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Perusahaan</h3>
              <div className="space-y-2 text-muted-foreground">
                <div>Tentang Kami</div>
                <div>Karir</div>
                <div>Kontak</div>
                <div>Blog</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Dukungan</h3>
              <div className="space-y-2 text-muted-foreground">
                <div>Pusat Bantuan</div>
                <div>Syarat & Ketentuan</div>
                <div>Kebijakan Privasi</div>
                <div>FAQ</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Web Learning Hub. Semua hak dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
