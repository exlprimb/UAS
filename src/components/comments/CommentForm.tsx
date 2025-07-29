import React, { useState } from 'react';
import apiClient from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CommentFormProps {
  lessonId: string;
  parentId?: string; // Opsional, untuk balasan
  onCommentPosted: () => void;
  placeholder?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({ lessonId, parentId, onCommentPosted, placeholder = "Tulis komentar..." }) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const payload = {
        content: content,
        parent_id: parentId || null,
      };
      
      // Menggunakan endpoint nested resource
      await apiClient.post(`/api/lessons/${lessonId}/comments`, payload);
      
      setContent('');
      toast({ title: "Sukses!", description: "Komentar Anda telah diposting." });
      onCommentPosted(); // Panggil callback untuk refresh
    } catch (error) {
      console.error("Gagal mengirim komentar:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim komentar. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !profile) {
    return null; // Jangan tampilkan form jika user tidak login
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
        <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="mb-2"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Mengirim...' : 'Kirim'}
          </Button>
        </div>
      </div>
    </form>
  );
};
