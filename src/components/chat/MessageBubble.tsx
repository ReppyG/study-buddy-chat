/*
  MESSAGE BUBBLE COMPONENT
  ========================
  This component displays a single message in the chat.
  - User messages appear on the right with a purple gradient
  - AI messages appear on the left with a dark background
  
  Props:
  - message: The message object containing the text and metadata
*/

import { Message } from '@/types/chat';
import { Bot, User } from 'lucide-react';

// Helper function to format the timestamp nicely
// Example: "2:30 PM" or "14:30" depending on locale
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  // Check if this message is from the user or the AI
  const isUser = message.role === 'user';

  return (
    // Container for the message - flex layout with conditional alignment
    <div
      className={`
        flex items-end gap-2 animate-slide-up
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
      `}
    >
      {/* Avatar icon - shows who sent the message */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'gradient-bg' : 'bg-secondary'}
        `}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-accent" />
        )}
      </div>

      {/* Message content bubble */}
      <div
        className={`
          max-w-[75%] px-4 py-3 rounded-2xl
          ${isUser 
            ? 'gradient-bg text-primary-foreground rounded-br-md' 
            : 'bg-ai text-ai-foreground rounded-bl-md border border-border'
          }
        `}
      >
        {/* The actual message text */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        
        {/* Timestamp shown below the message */}
        <p
          className={`
            text-xs mt-1.5
            ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}
          `}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
