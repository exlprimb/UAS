import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MessageSquare, Send } from 'lucide-react';

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

// 4. Mock API Data
const mockInitialComments: Comment[] = [
  {
    id: 'comment-1',
    content: 'Materi yang sangat bermanfaat! Apakah ada rekomendasi sumber belajar tambahan terkait topik ini?',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    user: { id: 'user-2', full_name: 'Ani', avatar_url: 'https://placehold.co/40x40/FBCFE8/9D27B0?text=A' },
    replies: [
      {
        id: 'reply-1',
        parentId: 'comment-1',
        content: 'Tentu! Coba cek dokumentasi resmi Laravel, di sana penjelasannya sangat lengkap.',
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
        user: { id: 'user-3', full_name: 'Pengajar (Tono)', avatar_url: 'https://placehold.co/40x40/BFDBFE/1D4ED8?text=T' },
        replies: []
      }
    ]
  },
  {
    id: 'comment-2',
    content: 'Penjelasannya mudah dipahami, terima kasih!',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    user: { id: 'user-4', full_name: 'Citra', avatar_url: 'https://placehold.co/40x40/FED7AA/F97316?text=C' },
    replies: []
  }
];

let mockCommentsData: Comment[] = JSON.parse(JSON.stringify(mockInitialComments));

const findComment = (comments: Comment[], id: string): Comment | null => {
    for (const comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
            const found = findComment(comment.replies, id);
            if (found) return found;
        }
    }
    return null;
}

// 5. Mock API Client (normally in @/lib/axios)
const apiClient = {
  get: async (url: string) => {
    console.log(`[MOCK GET] ${url}`);
    await new Promise(res => setTimeout(res, 500));
    return { data: { data: mockCommentsData.filter(c => !c.parentId) } };
  },
  post: async (url: string, payload: { content: string; parent_id?: string | null }) => {
    console.log(`[MOCK POST] ${url}`, payload);
    await new Promise(res => setTimeout(res, 500));
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content: payload.content,
      created_at: new Date().toISOString(),
      user: { id: 'user-1', full_name: 'Budi (Anda)', avatar_url: 'https://placehold.co/40x40/E2E8F0/475569?text=B' },
      parentId: payload.parent_id,
      replies: []
    };
    if (newComment.parentId) {
        const parent = findComment(mockCommentsData, newComment.parentId);
        if (parent) {
            parent.replies = parent.replies ? [...parent.replies, newComment] : [newComment];
        }
    } else {
        mockCommentsData.unshift(newComment);
    }
    return { data: newComment };
  }
};

// --- UI Components (normally in @/components/ui) ---
const Skeleton: React.FC<{ className?: string }> = ({ className }) => <div className={`animate-pulse bg-muted rounded-md ${className}`} />;
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

// --- Inlined Component: CommentItem ---
const CommentItem: React.FC<{ comment: Comment; lessonId: string; onReplySuccess: () => void; }> = ({ comment, lessonId, onReplySuccess }) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);

  const handleReplySuccess = () => {
    setIsReplying(false);
    onReplySuccess();
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
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: id })}</p>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        </div>
        <div className="mt-1 flex items-center space-x-2">
          {user && <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsReplying(!isReplying)}>{isReplying ? 'Batal' : 'Balas'}</Button>}
        </div>
        {isReplying && <div className="mt-2"><CommentForm lessonId={lessonId} parentId={comment.id} onCommentPosted={handleReplySuccess} placeholder="Tulis balasan..." /></div>}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 pl-4 ml-2 border-slate-200">
            {comment.replies.map((reply) => <CommentItem key={reply.id} comment={reply} lessonId={lessonId} onReplySuccess={onReplySuccess} />)}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component: CommentSection ---
export const CommentSection: React.FC<{ lessonId: string }> = ({ lessonId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/lessons/${lessonId}/comments`);
      setComments(response.data.data);
    } catch (error) {
      console.error("Gagal memuat komentar:", error);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCommentPosted = () => {
    fetchComments();
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Diskusi ({comments.length})</h3>
      {user && <div className="mb-6"><CommentForm lessonId={lessonId} onCommentPosted={handleCommentPosted} /></div>}
      <div className="space-y-6">
        {loading ? (
          <>
            <div className="flex items-start space-x-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div></div>
            <div className="flex items-start space-x-4"><Skeleton className="h-10 w-10 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-full" /></div></div>
          </>
        ) : comments.length > 0 ? (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} lessonId={lessonId} onReplySuccess={handleCommentPosted} />)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
            <p>Belum ada diskusi.</p>
            <p>Jadilah yang pertama memulai percakapan!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
