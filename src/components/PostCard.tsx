import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    user_id: string;
  };
}

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
  onAuthorClick?: (userId: string) => void;
}

export function PostCard({ post, currentUserId, onDelete, onAuthorClick }: PostCardProps) {
  const isOwner = currentUserId === post.profiles.user_id;

  const handleAuthorClick = () => {
    onAuthorClick?.(post.profiles.user_id);
  };

  return (
    <Card className="w-full bg-white dark:bg-zinc-900 shadow-md border border-zinc-200 dark:border-zinc-700 rounded-2xl transition-all hover:shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="border-2 border-white shadow-md">
              <AvatarFallback className="bg-white text-indigo-600 font-bold">
                {post.profiles.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <button
                onClick={handleAuthorClick}
                className="font-semibold text-sm hover:underline text-left"
              >
                {post.profiles.name}
              </button>
              <p className="text-xs text-white/80">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          {isOwner && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-800">
                <DropdownMenuItem
                  onClick={() => onDelete(post.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 px-6 text-zinc-700 dark:text-zinc-100 text-sm leading-relaxed">
        {post.content}
      </CardContent>

      <CardFooter className="pt-2 px-6 pb-4" />
    </Card>
  );
}
