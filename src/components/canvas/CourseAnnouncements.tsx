// Course announcements tab
import { useState } from 'react';
import { Bell, BellOff, User, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import type { CanvasAnnouncement } from '@/types/canvas';

interface CourseAnnouncementsProps {
  announcements: CanvasAnnouncement[];
}

export function CourseAnnouncements({ announcements }: CourseAnnouncementsProps) {
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  // Sort by posted date, newest first
  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
  );

  const isUnread = (id: number) => {
    // Mock: consider announcements from last 24h as unread unless marked
    const announcement = announcements.find(a => a.id === id);
    if (!announcement) return false;
    if (readIds.has(id)) return false;
    const postedDate = new Date(announcement.posted_at);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return postedDate > dayAgo;
  };

  const toggleRead = (id: number) => {
    const newReadIds = new Set(readIds);
    if (newReadIds.has(id)) {
      newReadIds.delete(id);
    } else {
      newReadIds.add(id);
    }
    setReadIds(newReadIds);
  };

  const unreadCount = sortedAnnouncements.filter(a => isUnread(a.id)).length;

  if (sortedAnnouncements.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg">No Announcements</h3>
        <p className="text-muted-foreground">There are no announcements for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span className="font-medium">{sortedAnnouncements.length} Announcements</span>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const allIds = new Set(sortedAnnouncements.map(a => a.id));
              setReadIds(allIds);
            }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Announcement List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => (
          <Card 
            key={announcement.id} 
            className={`transition-all ${isUnread(announcement.id) ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isUnread(announcement.id) && (
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {announcement.author.display_name}
                    </div>
                    <span>•</span>
                    <time dateTime={announcement.posted_at}>
                      {format(new Date(announcement.posted_at), 'MMM d, yyyy h:mm a')}
                    </time>
                    <span className="text-xs">
                      ({formatDistanceToNow(new Date(announcement.posted_at), { addSuffix: true })})
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleRead(announcement.id)}
                  title={isUnread(announcement.id) ? 'Mark as read' : 'Mark as unread'}
                >
                  {isUnread(announcement.id) ? (
                    <Bell className="h-4 w-4" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: announcement.message }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
