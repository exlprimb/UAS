-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'pengajar', 'pelajar');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'pelajar',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create course_modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create lesson_attachments table
CREATE TABLE public.lesson_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  UNIQUE(user_id, course_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Courses policies
CREATE POLICY "Published courses are viewable by everyone" ON public.courses
  FOR SELECT USING (status = 'published' OR auth.uid() = instructor_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Instructors can insert courses" ON public.courses
  FOR INSERT WITH CHECK (auth.uid() = instructor_id AND public.get_user_role(auth.uid()) IN ('pengajar', 'admin'));

CREATE POLICY "Instructors can update own courses, admins can update all" ON public.courses
  FOR UPDATE USING (auth.uid() = instructor_id OR public.get_user_role(auth.uid()) = 'admin');

-- Course modules policies
CREATE POLICY "Modules viewable for enrolled users or course owners" ON public.course_modules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND (instructor_id = auth.uid() OR status = 'published')) OR
    EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = course_modules.course_id) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Course owners can manage modules" ON public.course_modules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Lessons policies
CREATE POLICY "Lessons viewable for enrolled users or preview lessons" ON public.lessons
  FOR SELECT USING (
    is_preview = true OR
    EXISTS (
      SELECT 1 FROM public.course_modules cm 
      JOIN public.courses c ON cm.course_id = c.id 
      WHERE cm.id = module_id AND (
        c.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = c.id)
      )
    ) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Course owners can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm 
      JOIN public.courses c ON cm.course_id = c.id 
      WHERE cm.id = module_id AND (c.instructor_id = auth.uid() OR public.get_user_role(auth.uid()) = 'admin')
    )
  );

-- Lesson attachments policies
CREATE POLICY "Attachments follow lesson access" ON public.lesson_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.course_modules cm ON l.module_id = cm.id
      JOIN public.courses c ON cm.course_id = c.id
      WHERE l.id = lesson_id AND (
        l.is_preview = true OR
        c.instructor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = c.id) OR
        public.get_user_role(auth.uid()) = 'admin'
      )
    )
  );

-- Enrollments policies
CREATE POLICY "Users can view own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can enroll themselves" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment progress" ON public.enrollments
  FOR UPDATE USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

-- Comments policies
CREATE POLICY "Comments viewable by enrolled users" ON public.comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = comments.course_id) OR
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.courses WHERE id = comments.course_id AND instructor_id = auth.uid()) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Enrolled users can add comments" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = auth.uid() AND course_id = comments.course_id) OR
      EXISTS (SELECT 1 FROM public.courses WHERE id = comments.course_id AND instructor_id = auth.uid()) OR
      public.get_user_role(auth.uid()) = 'admin'
    )
  );

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id OR public.get_user_role(auth.uid()) = 'admin');

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for auto-creating profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'pelajar');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Programming', 'programming', 'Kursus pemrograman dan teknologi', 'Code'),
('Design', 'design', 'Kursus desain grafis dan UI/UX', 'Palette'),
('Business', 'business', 'Kursus bisnis dan entrepreneurship', 'TrendingUp'),
('Language', 'language', 'Kursus bahasa asing', 'Globe'),
('Science', 'science', 'Kursus sains dan matematika', 'Atom');