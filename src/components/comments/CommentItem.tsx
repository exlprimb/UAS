import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

// --- Mocks, Types, and UI Components (Self-Contained for Demo) ---
// In a real project, these would be in separate files.

// 1. Mock Type Definitions (normally in @/types)
interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: UserProfile;
  replies?: Comment[];
  parentId?: string | null;
}

// 2. Mock Auth Hook (normally in @/hooks/useAuth)
const useAuth = () => ({
  user: { id: 'user-1', full_name: 'Budi (Anda)', avatar_url: 'https://placehold.co/40x40/E2E8F0/475569?text=B' },
  profile: { id: 'user-1', full_name: 'Budi (Anda)', avatar_url: 'https://placehold.co/40x40/E2E8F0/475569?text=B' },
});

// 3. Mock Toast Hook (normally from shadcn/ui)
const useToast = () => ({
  toast: (options: { title: string; description: string; variant?: string }) => {
    console.log('Toast:', options.title, '-', options.description);
    // In a real app, a toast notification would appear.
  }
});

// 4. Mock API Client (normally in @/lib/axios)
const apiClient = {
  post: async (url: string, payload: { content: string; parent_id?: string | null }) => {
    console.log(`[MOCK POST] ${url}`, payload);
    await new Promise(res => setTimeout(res, 500));
    return { data: {} };
  }
};

// 5. UI Components (normally in @/components/ui)
const Avatar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>{children}</div>;
const AvatarImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => <img src={src} alt={alt} className="aspect-square h-full w-full" onError={(e) => (e.currentTarget.style.display = 'none')} />;
const AvatarFallback: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">{children}</div>;
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'ghost' | 'default'; size?: 'sm' | 'default' }> = ({ children, className, ...props }) => <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium ${className}`} {...props}>{children}</button>;
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => <textarea className={`flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />;

// --- Inlined Component: CommentForm ---
const CommentForm: React.FC<{ lessonId: string; parentId?: string; onCommentPosted: () => void; placeholder?: string; }> = ({ lessonId, parentId, onCommentPosted, placeholder = "Tulis komentar..." }) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/lessons/${lessonId}/comments`, { content, parent_id: parentId || null });
      setContent('');
      toast({ title: "Sukses!", description: "Komentar Anda telah diposting." });
      onCommentPosted();
    } catch (error) {
      console.error("Gagal mengirim komentar:", error);
      toast({ title: "Error", description: "Gagal mengirim komentar.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
        <AvatarFallback>{profile.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={placeholder} rows={2} className="mb-2" />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || !content.trim()}>{isSubmitting ? 'Mengirim...' : 'Kirim'}</Button>
        </div>
      </div>
    </form>
  );
};

// --- Main Component: CommentItem ---
interface CommentItemProps {
  comment: Comment;
  lessonId: string;
  onReplySuccess: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, lessonId, onReplySuccess }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySuccess = () => {
    setIsReplying(false); // Tutup form balasan
    onReplySuccess(); // Panggil fungsi refresh dari parent
  };

  return (
    <div className="flex items-start space-x-4">
      <Avatar>
        <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.full_name} />
        <AvatarFallback>{comment.user?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm">{comment.user?.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}
            </p>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        </div>
        
        {/* Aksi Komentar */}
        <div className="mt-1 flex items-center space-x-2">
          {user && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsReplying(!isReplying)}>
              {isReplying ? 'Batal' : 'Balas'}
            </Button>
          )}
          {/* Anda bisa menambahkan tombol Edit/Delete di sini dengan otorisasi */}
        </div>
        
        {/* Form Balasan */}
        {isReplying && (
          <div className="mt-2">
            <CommentForm
              lessonId={lessonId}
              parentId={comment.id}
              onCommentPosted={handleReplySuccess}
              placeholder="Tulis balasan..."
            />
          </div>
        )}
        
        {/* Render Balasan (Rekursif) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 pl-4 ml-2 border-slate-200">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} lessonId={lessonId} onReplySuccess={onReplySuccess} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
