import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Film, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  type: 'review' | 'comment';
  title: string;
  subtitle: string;
  createdAt: Date;
  reviewId?: string;
}

interface NotificationDropdownProps {
  unreadCount: number;
  onMarkAllRead: () => void;
  lastSeen: Date;
  showReviews: boolean;
  showComments: boolean;
}

export function NotificationDropdown({
  unreadCount,
  onMarkAllRead,
  lastSeen,
  showReviews,
  showComments,
}: NotificationDropdownProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, lastSeen, showReviews, showComments]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const items: NotificationItem[] = [];

      if (showReviews) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('id, title, snippet, created_at')
          .gt('created_at', lastSeen.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (reviews) {
          items.push(
            ...reviews.map(r => ({
              id: `review-${r.id}`,
              type: 'review' as const,
              title: r.title,
              subtitle: r.snippet || 'New review posted',
              createdAt: new Date(r.created_at),
              reviewId: r.id,
            }))
          );
        }
      }

      if (showComments) {
        const { data: comments } = await supabase
          .from('comments')
          .select('id, text, display_name, created_at, review_id')
          .gt('created_at', lastSeen.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (comments) {
          items.push(
            ...comments.map(c => ({
              id: `comment-${c.id}`,
              type: 'comment' as const,
              title: c.display_name,
              subtitle: c.text.length > 50 ? `${c.text.slice(0, 50)}...` : c.text,
              createdAt: new Date(c.created_at),
              reviewId: c.review_id,
            }))
          );
        }
      }

      // Sort by date, newest first
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setNotifications(items.slice(0, 15));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (item.reviewId) {
      navigate(`/review/${item.reviewId}`);
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    onMarkAllRead();
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications ({unreadCount} unread)</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-background border border-border shadow-xl" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-primary hover:text-primary/80"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === 'review' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/20 text-secondary-foreground'
                  }`}>
                    {item.type === 'review' ? (
                      <Film className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-border p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigate('/settings');
              setIsOpen(false);
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Notification Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
