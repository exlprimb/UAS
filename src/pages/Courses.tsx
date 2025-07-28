import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { CourseCard } from '@/components/CourseCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Grid3X3, 
  List,
  Code,
  Palette,
  TrendingUp,
  Globe,
  Atom,
  BookOpen
} from 'lucide-react';

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
  {
    id: '4',
    title: 'Digital Marketing Strategy',
    slug: 'digital-marketing-strategy',
    description: 'Strategi pemasaran digital yang efektif untuk mengembangkan bisnis di era digital.',
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    price: 349000,
    is_free: false,
    status: 'published' as const,
    instructor_id: '3',
    category: { id: '3', name: 'Business', slug: 'business', icon: 'TrendingUp', created_at: '' },
    instructor: { id: '3', email: '', full_name: 'Mike Johnson', role: 'pengajar' as const, created_at: '', updated_at: '' },
    enrollments_count: 750,
    is_enrolled: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    title: 'English for Business Communication',
    slug: 'business-english',
    description: 'Tingkatkan kemampuan bahasa Inggris untuk komunikasi bisnis yang efektif.',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop',
    price: 199000,
    is_free: false,
    status: 'published' as const,
    instructor_id: '4',
    category: { id: '4', name: 'Language', slug: 'language', icon: 'Globe', created_at: '' },
    instructor: { id: '4', email: '', full_name: 'Sarah Wilson', role: 'pengajar' as const, created_at: '', updated_at: '' },
    enrollments_count: 445,
    is_enrolled: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: '6',
    title: 'Data Science dengan Python',
    slug: 'data-science-python',
    description: 'Analisis data dan machine learning menggunakan Python untuk pemula hingga advanced.',
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    price: 499000,
    is_free: false,
    status: 'published' as const,
    instructor_id: '5',
    category: { id: '5', name: 'Science', slug: 'science', icon: 'Atom', created_at: '' },
    instructor: { id: '5', email: '', full_name: 'Dr. Robert Chen', role: 'pengajar' as const, created_at: '', updated_at: '' },
    enrollments_count: 980,
    is_enrolled: false,
    created_at: '',
    updated_at: '',
  },
];

const categories = [
  { id: '1', name: 'Programming', slug: 'programming', icon: Code, count: 45 },
  { id: '2', name: 'Design', slug: 'design', icon: Palette, count: 32 },
  { id: '3', name: 'Business', slug: 'business', icon: TrendingUp, count: 28 },
  { id: '4', name: 'Language', slug: 'language', icon: Globe, count: 19 },
  { id: '5', name: 'Science', slug: 'science', icon: Atom, count: 15 },
];

export default function Courses() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredCourses, setFilteredCourses] = useState(mockCourses);

  useEffect(() => {
    let filtered = mockCourses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || course.category?.slug === selectedCategory;
      
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'free' && course.is_free) ||
                          (priceFilter === 'paid' && !course.is_free);
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort courses
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.enrollments_count || 0) - (a.enrollments_count || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, priceFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Katalog Kursus</h1>
          <p className="text-lg text-muted-foreground">
            Temukan kursus yang tepat untuk mengembangkan keterampilan Anda
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Kategori Populer</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-medium ${
                  selectedCategory === category.slug ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.slug)}
              >
                <div className="text-center">
                  <category.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.count} kursus</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="text-sm font-medium mb-2 block">Cari Kursus</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kursus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Kategori</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Harga</label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Harga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Harga</SelectItem>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="paid">Berbayar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <label className="text-sm font-medium mb-2 block">Urutkan</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Paling Populer</SelectItem>
                  <SelectItem value="newest">Terbaru</SelectItem>
                  <SelectItem value="price-low">Harga Terendah</SelectItem>
                  <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Toggle and Results Count */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Menampilkan {filteredCourses.length} dari {mockCourses.length} kursus
              </span>
              {(searchTerm || selectedCategory !== 'all' || priceFilter !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceFilter('all');
                    setSortBy('popular');
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Tidak ada kursus ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Coba ubah filter pencarian atau kata kunci yang Anda gunakan
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceFilter('all');
              }}
            >
              Reset Pencarian
            </Button>
          </Card>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isPreview={!user}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredCourses.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}