"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CreatePost } from "@/components/community/create-post";
import { PostCard } from "@/components/community/post-card";
import { UsersRound, Music } from "lucide-react";

export default function CommunityPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 sm:p-10 mb-8 text-white relative overflow-hidden shadow-lg">
        {/* Decorative notes */}
        <Music className="absolute -top-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
        <Music className="absolute -bottom-10 left-10 w-40 h-40 opacity-10 -rotate-12" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm mb-4">
            <UsersRound className="w-4 h-4" /> พื้นที่สำหรับคนรักดนตรี
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">BUU Music Community</h1>
          <p className="text-white/80 max-w-md text-sm sm:text-base">
            พูดคุย แลกเปลี่ยนความรู้ หาสมาชิกตั้งวง หรืออวดผลงานการซ้อมของคุณได้ที่นี่
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <CreatePost 
          userImage={session?.user?.image || undefined} 
          onSuccess={fetchPosts} 
        />

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card border rounded-2xl p-10 text-center text-muted-foreground">
            <UsersRound className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>ยังไม่มีโพสต์ในชุมชน มาเป็นคนแรกที่เริ่มพูดคุยกันเถอะ!</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onCommentSuccess={fetchPosts}
                currentUserEmail={session?.user?.email || undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
