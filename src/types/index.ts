export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'pengajar' | 'pelajar';
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price: number;
  is_free: boolean;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  instructor_id: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  instructor?: User;
  category?: Category;
  enrollments_count?: number;
  is_enrolled?: boolean;
  modules?: CourseModule[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content?: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  is_preview: boolean;
  created_at: string;
  attachments?: LessonAttachment[];
}

export interface LessonAttachment {
  id: string;
  lesson_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress: number;
  course?: Course;
}

export interface Comment {
  id: string;
  course_id: string;
  lesson_id?: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}