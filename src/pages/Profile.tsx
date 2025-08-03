import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PostCard } from '@/components/PostCard';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  bio: string | null;
  email: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    user_id: string;
  };
}

const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    
    fetchProfile();
  }, [userId, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
     setPosts(postsData as any as Post[]);



    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Profile</h1>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-lg">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {isOwnProfile && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          
          {profile.bio && (
            <CardContent>
              <p className="text-sm">{profile.bio}</p>
            </CardContent>
          )}
        </Card>

        {/* Posts Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Posts ({posts.length})
          </h2>
          
          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id}
                  onDelete={isOwnProfile ? handleDeletePost : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;