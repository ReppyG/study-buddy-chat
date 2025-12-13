/*
  TYPING INDICATOR COMPONENT
  ==========================
  Shows animated dots when the AI is "thinking" and generating a response.
  This gives users feedback that something is happening!
*/

import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      {/* AI avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <Bot className="w-4 h-4 text-accent" />
      </div>

      {/* Typing bubble with animated dots */}
      <div className="bg-ai border border-border rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          {/* Three animated dots - each has a different delay */}
          <span 
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce-dots"
            style={{ animationDelay: '0ms' }}
          />
          <span 
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce-dots"
            style={{ animationDelay: '150ms' }}
          />
          <span 
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce-dots"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
