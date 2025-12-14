import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, Bell, MessageSquare, User, Command, Check, Clock,
  BookOpen, CheckSquare, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const TopBar: React.FC = () => {
  const {
    openCommandPalette,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    setRightPanelTab,
  } = useApp();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'canvas': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-green-500" />;
      case 'ai': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 gap-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search everything...</span>
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border text-xs">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Chat Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightPanelTab('chat')}
          className="relative"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-popover border border-border z-50" align="end">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-semibold">Notifications</h3>
              {unreadNotificationCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllNotificationsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 10).map(notification => (
                    <button
                      key={notification.id}
                      onClick={() => markNotificationRead(notification.id)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 text-left hover:bg-accent transition-colors',
                        !notification.read && 'bg-primary/5'
                      )}
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm', !notification.read && 'font-medium')}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        {/* Profile */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-popover border border-border z-50" align="end">
            <div className="space-y-1">
              <p className="px-2 py-1 text-sm font-medium">Student</p>
              <hr className="border-border" />
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Profile
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Settings
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
