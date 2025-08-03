import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    user_id: string;
  };
}

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
  .from("posts")
  .select("id, content, created_at, user_id")
  .order("created_at", { ascending: false });


      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch community posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">🌐 Community</h1>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading posts...
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No posts yet. Be the first to share something!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onDelete={undefined} // Don't allow deleting from community view
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
