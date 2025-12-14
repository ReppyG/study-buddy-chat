/*
  UPDATED INDEX PAGE
  ==================
  Now includes Chat, Pomodoro Timer, Assignment Tracker, Canvas, AI Tools, and Smart Chat Sidebar
*/

import { useState } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { AssignmentTracker } from '@/components/assignments/AssignmentTracker';
import { CanvasDashboard } from '@/components/canvas/CanvasDashboard';
import { AIStudyHub } from '@/components/ai-study/AIStudyHub';
import { SmartChatSidebar, SmartChatToggle } from '@/components/chat/SmartChatSidebar';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Timer, Sparkles, ClipboardList, Settings, Brain } from 'lucide-react';

type TabType = 'timer' | 'assignments' | 'chat' | 'canvas' | 'ai-tools';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('assignments');
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Study Buddy - Productivity App for Students</title>
        <meta 
          name="description" 
          content="All-in-one study app with Pomodoro timer, assignment tracker, and AI chat assistant." 
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center gap-2 p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-1 mr-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground hidden sm:inline">Study Buddy</span>
          </div>
          
          <button
            onClick={() => setActiveTab('timer')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'timer'
                ? 'gradient-bg text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <Timer className="w-4 h-4" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'assignments'
                ? 'gradient-bg text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Assignments</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'chat'
                ? 'gradient-bg text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-tools')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'ai-tools'
                ? 'gradient-bg text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">AI Tools</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeTab === 'canvas'
                ? 'gradient-bg text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }
            `}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Canvas</span>
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1">
          {activeTab === 'timer' && (
            <div className="container max-w-lg mx-auto py-8 px-4">
              <PomodoroTimer />
            </div>
          )}
          {activeTab === 'assignments' && (
            <div className="container max-w-5xl mx-auto py-6 px-4">
              <AssignmentTracker />
            </div>
          )}
          {activeTab === 'chat' && <ChatContainer />}
          {activeTab === 'ai-tools' && (
            <div className="container max-w-5xl mx-auto py-6 px-4">
              <AIStudyHub />
            </div>
          )}
          {activeTab === 'canvas' && (
            <div className="container max-w-5xl mx-auto py-6 px-4">
              <CanvasDashboard />
            </div>
          )}
        </main>

        {/* Smart Chat Floating Button & Sidebar */}
        <SmartChatToggle onClick={() => setIsChatOpen(true)} />
        <SmartChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </>
  );
};

export default Index;
