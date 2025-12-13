/*
  UPDATED INDEX PAGE
  ==================
  Now includes both Chat and Pomodoro Timer with tabs to switch between them
*/

import { useState } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Timer, Sparkles } from 'lucide-react';

type TabType = 'chat' | 'timer';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('timer');

  return (
    <>
      <Helmet>
        <title>Study Buddy AI - Your Personal Study Assistant</title>
        <meta 
          name="description" 
          content="An AI-powered study assistant with Pomodoro timer to help students focus and succeed." 
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center gap-2 p-4 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-1 mr-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Study Buddy</span>
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
            Timer
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
            AI Chat
          </button>
        </nav>

        {/* Content */}
        <main className="flex-1">
          {activeTab === 'timer' ? (
            <div className="container max-w-lg mx-auto py-8 px-4">
              <PomodoroTimer />
            </div>
          ) : (
            <ChatContainer />
          )}
        </main>
      </div>
    </>
  );
};

export default Index;
