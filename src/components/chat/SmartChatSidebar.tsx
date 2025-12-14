import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Mic, MicOff, Trash2, Download, 
  ChevronRight, MessageCircle, Zap, BookOpen, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSmartChat } from '@/hooks/useSmartChat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { SmartChatInput } from './SmartChatInput';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SmartChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmartChatSidebar({ isOpen, onClose }: SmartChatSidebarProps) {
  const {
    messages,
    isLoading,
    error,
    isListening,
    sendMessage,
    clearChat,
    startListening,
    stopListening,
    exportChat,
    getSuggestedPrompts,
    hasContext,
  } = useSmartChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestedPrompts = getSuggestedPrompts();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClearChat = () => {
    clearChat();
    toast.success('Chat cleared!');
  };

  const handleExportChat = () => {
    exportChat();
    toast.success('Chat exported!');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border shadow-2xl z-50",
        "transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center animate-pulse-glow">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Study Assistant</h2>
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  hasContext ? "bg-green-500" : "bg-yellow-500"
                )} />
                <span className="text-xs text-muted-foreground">
                  {hasContext ? "Canvas connected" : "No Canvas data"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleExportChat}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Empty State */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4 animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold gradient-text mb-2">
                Hey! 👋 I'm your Study Assistant
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                I can help with assignments, grades, study plans, and more. 
                {!hasContext && " Connect Canvas to get personalized help!"}
              </p>

              {/* Feature Cards */}
              <div className="w-full space-y-2 mb-6">
                <FeatureCard 
                  icon={<Target className="w-4 h-4" />}
                  title="Priority Tasks"
                  description="Get smart recommendations"
                />
                <FeatureCard 
                  icon={<BookOpen className="w-4 h-4" />}
                  title="Study Help"
                  description="Explanations & flashcards"
                />
                <FeatureCard 
                  icon={<Zap className="w-4 h-4" />}
                  title="Quick Insights"
                  description="Grades & deadlines"
                />
              </div>

              {/* Suggested Prompts */}
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedPrompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full text-xs bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Follow-ups (when there are messages) */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {suggestedPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="flex-shrink-0 px-3 py-1 rounded-full text-xs bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors border border-border whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-card/50">
          <SmartChatInput 
            onSend={sendMessage}
            isLoading={isLoading}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
          />
        </div>
      </div>
    </>
  );
}

// Feature card component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// Floating toggle button
export function SmartChatToggle({ onClick, hasUnread }: { onClick: () => void; hasUnread?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-bg shadow-lg hover:scale-105 transition-transform flex items-center justify-center z-30 animate-pulse-glow"
    >
      <MessageCircle className="w-6 h-6 text-primary-foreground" />
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive border-2 border-background" />
      )}
    </button>
  );
}
