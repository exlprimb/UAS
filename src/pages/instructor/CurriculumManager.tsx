import React from 'react';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Edit, GripVertical, BookOpen } from 'lucide-react';
// import apiClient from '@/lib/axios'; // Aktifkan saat dihubungkan ke backend
// import { useToast } from '@/hooks/use-toast'; // Aktifkan saat dihubungkan

interface CurriculumManagerProps {
  course: Course;
  onUpdate: () => void; // Fungsi untuk me-refresh data kursus
}

export const CurriculumManager: React.FC<CurriculumManagerProps> = ({ course, onUpdate }) => {
  // const { toast } = useToast(); // Aktifkan saat dihubungkan

  const handleAddModule = async (title: string) => {
    // Logika API call untuk menambah modul
    // await apiClient.post(`/api/courses/${course.id}/modules`, { title });
    // toast({ title: "Sukses", description: `Modul "${title}" berhasil ditambahkan.` });
    alert(`MOCK: Menambah modul "${title}"`);
    onUpdate();
  };
  
  const handleAddLesson = async (moduleId: string, title: string) => {
    // Logika API call untuk menambah pelajaran
    // await apiClient.post(`/api/modules/${moduleId}/lessons`, { title });
    // toast({ title: "Sukses", description: `Pelajaran "${title}" berhasil ditambahkan.` });
    alert(`MOCK: Menambah pelajaran "${title}" ke modul ${moduleId}`);
    onUpdate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Kurikulum</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Tambah Modul</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Buat Modul Baru</DialogTitle>
                <DialogDescription>Masukkan judul untuk modul baru Anda.</DialogDescription>
              </DialogHeader>
              {/* Form Tambah Modul akan ada di sini */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {course.modules.map(module => (
            <AccordionItem value={module.id} key={module.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  {module.title}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-6 space-y-2">
                  {module.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2">
                         <BookOpen className="h-4 w-4 text-muted-foreground" />
                         <span>{lesson.title}</span>
                      </div>
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                    </div>
                  ))}
                   <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                          <Plus className="mr-2 h-4 w-4" /> Tambah Pelajaran
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pelajaran Baru di Modul "{module.title}"</DialogTitle>
                        </DialogHeader>
                         {/* Form Tambah Pelajaran akan ada di sini */}
                      </DialogContent>
                   </Dialog>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
