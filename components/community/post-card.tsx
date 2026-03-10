"use client";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface PostCardProps {
  post: any;
  onCommentSuccess: () => void;
  currentUserEmail?: string;
}

export function PostCard({ post, onCommentSuccess, currentUserEmail }: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText })
      });

      if (res.ok) {
        setCommentText("");
        onCommentSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: th
  });

  return (
    <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Post Header */}
        <div className="flex items-center gap-3">
          <img 
            src={post.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${post.user.name}`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full bg-muted border border-border" 
          />
          <div>
            <h3 className="font-semibold text-sm sm:text-base leading-none">
              {post.user.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {post.user.faculty && <span className="mr-2">{post.user.faculty}</span>}
              · {formattedDate}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <p className="mt-4 text-foreground whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="w-full bg-muted/30 border-t border-b overflow-hidden">
          <img 
            src={post.mediaUrl} 
            alt="Post media" 
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-2 sm:p-3 flex items-center gap-2 border-b">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 hover:bg-accent rounded-xl text-sm font-medium text-muted-foreground transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          {post.comments?.length || 0} ความคิดเห็น
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-muted/10">
          <div className="max-h-[300px] overflow-y-auto px-4 py-3 sm:px-5 space-y-4">
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-3">
                <img 
                  src={comment.user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user.name}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full bg-muted mt-1 shrink-0"
                />
                <div className="bg-card border rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                  <h4 className="font-semibold text-xs text-foreground mb-1">
                    {comment.user.name}
                  </h4>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            {post.comments?.length === 0 && (
               <p className="text-sm text-center text-muted-foreground italic py-4">
                 ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นสิ!
               </p>
            )}
          </div>

          <form onSubmit={handleComment} className="p-3 sm:p-4 border-t flex gap-3 bg-muted/20">
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=Me`} 
              alt="Avatar"
              className="w-8 h-8 rounded-full bg-muted shrink-0"
            />
            <div className="flex-1 border bg-card rounded-full flex items-center pr-1 overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <input 
                type="text"
                placeholder="แสดงความคิดเห็น..."
                className="flex-1 bg-transparent border-none py-2 px-4 outline-none text-sm"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button 
                type="submit"
                disabled={!commentText.trim() || loading}
                className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -ml-0.5" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
