import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';
import { Clock, Users, Star, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  isPreview?: boolean;
}

export const CourseCard = ({ course, isPreview = false }: CourseCardProps) => {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-medium transition-all duration-300 hover:scale-105 bg-gradient-card border-0">
      <div className="relative">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-primary flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-white opacity-70" />
          </div>
        )}
        
        {isPreview && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              <PlayCircle className="w-16 h-16 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium">Preview Mode</p>
              <p className="text-xs opacity-80">Masuk untuk akses penuh</p>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant={course.is_free ? 'secondary' : 'default'} className="bg-white/90 text-foreground">
            {formatPrice(course.price)}
          </Badge>
        </div>

        {course.status !== 'published' && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90">
              {course.status === 'pending' ? 'Pending' : 'Draft'}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            
            {course.category && (
              <Badge variant="outline" className="text-xs mb-2">
                {course.category.name}
              </Badge>
            )}
          </div>
        </div>

        {course.description && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollments_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>8 jam</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-current text-yellow-500" />
              <span>4.8</span>
            </div>
          </div>
        </div>

        {course.instructor && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {course.instructor.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {course.instructor.full_name}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          {isPreview ? (
            <Button asChild className="flex-1" variant="outline">
              <Link to="/auth">Masuk untuk Mengakses</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="flex-1" variant="default">
                <Link to={`/courses/${course.slug}`}>
                  {course.is_enrolled ? 'Lanjutkan Belajar' : 'Lihat Detail'}
                </Link>
              </Button>
              {!course.is_enrolled && (
                <Button variant="secondary" size="sm">
                  Preview
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};