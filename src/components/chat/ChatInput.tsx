/*
  CHAT INPUT COMPONENT
  ====================
  The text input and send button at the bottom of the chat.
  
  Features:
  - Expands as you type (textarea grows with content)
  - Send on Enter key (Shift+Enter for new line)
  - Disabled while AI is thinking
  - Beautiful purple glow on focus
  
  Props:
  - onSend: Function to call when user sends a message
  - isLoading: Whether the AI is currently thinking
*/

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  // State to track what the user is typing
  const [input, setInput] = useState('');
  
  // Reference to the textarea element for auto-resizing
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight (content height) with a max
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Handle form submission
  const handleSubmit = () => {
    // Don't send empty messages or while loading
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Call the onSend function passed from parent
    onSend(trimmedInput);
    
    // Clear the input
    setInput('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but not Shift+Enter which adds a new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
      {/* Input container with glow effect */}
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        {/* Textarea wrapper with focus glow */}
        <div className="flex-1 relative group">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything... (Enter to send, Shift+Enter for new line)"
            disabled={isLoading}
            rows={1}
            className="
              w-full px-4 py-3 
              bg-input border border-border rounded-xl
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              resize-none overflow-y-auto
              transition-all duration-200
              text-sm
            "
          />
          {/* Subtle gradient glow on focus */}
          <div className="
            absolute inset-0 -z-10 rounded-xl opacity-0 group-focus-within:opacity-100
            bg-gradient-to-r from-primary/20 to-accent/20 blur-xl
            transition-opacity duration-300
          " />
        </div>

        {/* Send button with gradient */}
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="
            gradient-bg text-primary-foreground
            px-4 py-3 h-auto rounded-xl
            hover:opacity-90 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            animate-pulse-glow
          "
        >
          {isLoading ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground mt-2">
        Powered by AI • Press Enter to send
      </p>
    </div>
  );
}
