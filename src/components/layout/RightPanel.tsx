import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, MessageSquare, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartChatSidebar } from '@/components/chat/SmartChatSidebar';

export const RightPanel: React.FC = () => {
  const { rightPanelOpen, rightPanelTab, setRightPanelTab, toggleRightPanel } = useApp();

  if (!rightPanelOpen) return null;

  return (
    <aside className="w-96 h-screen bg-card border-l border-border flex flex-col">
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)}>
          <TabsList className="h-9">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon" onClick={toggleRightPanel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {rightPanelTab === 'chat' && (
          <SmartChatSidebar isOpen={true} onClose={toggleRightPanel} />
        )}
        {rightPanelTab === 'notifications' && (
          <div className="p-4 text-center text-muted-foreground">
            Activity feed coming soon
          </div>
        )}
      </div>
    </aside>
  );
};
