import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CreatePost } from '@/components/CreatePost';
import { PostCard } from '@/components/PostCard';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    user_id: string;
  };
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  email: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user profile and posts
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchPosts();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const { data, error } = await supabase
  .from('posts')
  .select(`
    id,
    content,
    created_at,
    user_id,
    profiles (
      name,
      user_id
    )
  `)
  .order('created_at', { ascending: false }) as unknown as { data: Post[]; error: any };

    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Success",
        description: "Post deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAuthorClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Community</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/profile/${user.id}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Create Post */}
        <CreatePost userProfile={userProfile} onPostCreated={fetchPosts} />

        {/* Posts Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          
          {postsLoading ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Loading posts...</p>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to share something!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                  onDelete={handleDeletePost}
                  onAuthorClick={handleAuthorClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
