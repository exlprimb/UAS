import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/axios';
import { Save, Send, Trash2 } from 'lucide-react';

import { FileUpload } from './FileUpload'; 
import { CurriculumManager } from './CurriculumManager';

// Mock data untuk development
const mockCourse: Course = {
  id: 'course-123',
  slug: 'belajar-react-dari-dasar',
  title: 'Belajar React dari Dasar',
  description: 'Kursus komprehensif untuk pemula yang ingin menguasai React.',
  price: 299000,
  is_free: false,
  thumbnail_url: 'https://placehold.co/1200x600/BFDBFE/1D4ED8?text=Thumbnail+Kursus',
  category_id: 'cat-1',
  status: 'draft',
  modules: [
    { id: 'module-1', title: 'Pendahuluan', lessons: [{ id: 'lesson-1a', title: 'Apa itu React?' }, { id: 'lesson-1b', title: 'Setup Lingkungan' }] },
    { id: 'module-2', title: 'Konsep Dasar', lessons: [{ id: 'lesson-2a', title: 'Komponen & Props' }, { id: 'lesson-2b', title: 'State & Lifecycle' }] },
  ],
};

const EditCoursePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    try {
      // const response = await apiClient.get(`/api/courses/${slug}`);
      // setCourse(response.data.data);
      setCourse(mockCourse); 
    } catch (error) {
      console.error("Gagal memuat kursus:", error);
      toast({ title: "Error", description: "Gagal memuat data kursus.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [slug, toast]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleUploadThumbnail = async (fileToUpload: File) => {
    if (!course) return;
    const formData = new FormData();
    formData.append('thumbnail', fileToUpload);
    try {
      // const response = await apiClient.post(`/api/courses/${course.slug}/upload-thumbnail`, formData, { ... });
      console.log("MOCK UPLOAD:", fileToUpload.name);
      await new Promise(res => setTimeout(res, 1000));
      const newThumbnailUrl = URL.createObjectURL(fileToUpload);
      setCourse(prev => prev ? { ...prev, thumbnail_url: newThumbnailUrl } : null);
      toast({ title: "Sukses", description: "Thumbnail berhasil diunggah." });
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengunggah thumbnail.", variant: "destructive" });
    }
  };
  
  const handlePublish = async () => {
    if(!course) return;
    // await apiClient.put(`/api/courses/${course.slug}/publish`, { status: 'pending' });
    toast({ title: "Terkirim!", description: "Kursus telah dikirim untuk direview oleh admin."});
    setCourse(prev => prev ? { ...prev, status: 'pending' } : null);
  }

  if (loading) return <div className="p-8">Memuat data kursus...</div>;
  if (!course) return <div className="p-8">Kursus tidak ditemukan.</div>;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Edit Kursus</h1>
      <p className="text-muted-foreground mb-6">Anda sedang mengedit: {course.title}</p>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Info Dasar</TabsTrigger>
          <TabsTrigger value="curriculum">Kurikulum</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info">
          <Card>
            <CardHeader><CardTitle>Informasi Dasar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Kursus</Label>
                <Input id="title" defaultValue={course.title} />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea id="description" defaultValue={course.description} rows={5} />
              </div>
              <div>
                <Label>Thumbnail</Label>
                <FileUpload onFileUpload={handleUploadThumbnail} initialPreview={course.thumbnail_url} />
              </div>
               <div className="flex justify-end">
                <Button><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <CurriculumManager course={course} onUpdate={fetchCourse} />
        </TabsContent>

        <TabsContent value="settings">
            <Card>
                <CardHeader><CardTitle>Publikasi & Pengaturan</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Status Kursus</h4>
                        <p className="text-sm p-2 bg-blue-100 text-blue-800 rounded-md">Saat ini: <span className="font-bold uppercase">{course.status}</span></p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Kirim untuk Review</h4>
                        <p className="text-sm text-muted-foreground mb-4">Setelah kurikulum selesai, Anda bisa mengirim kursus ini untuk direview oleh admin. Setelah disetujui, kursus akan dipublikasikan.</p>
                        <Button onClick={handlePublish} variant="default" className="bg-green-600 hover:bg-green-700 text-white"><Send className="mr-2 h-4 w-4" /> Kirim untuk Review</Button>
                    </div>
                    <div className="border-t pt-6">
                        <h4 className="font-semibold mb-2 text-red-600">Zona Berbahaya</h4>
                        <p className="text-sm text-muted-foreground mb-4">Menghapus kursus adalah tindakan permanen dan tidak dapat dibatalkan.</p>
                        <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white"><Trash2 className="mr-2 h-4 w-4" /> Hapus Kursus Ini</Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditCoursePage;
