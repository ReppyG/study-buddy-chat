import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SmartChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

export function SmartChatInput({ 
  onSend, 
  isLoading, 
  isListening,
  onStartListening,
  onStopListening,
}: SmartChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;
    onSend(trimmedInput);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="flex items-end gap-2">
      {/* Voice Input Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleVoiceClick}
        className={cn(
          "h-10 w-10 rounded-xl flex-shrink-0 transition-colors",
          isListening && "bg-destructive/20 text-destructive animate-pulse"
        )}
        disabled={isLoading}
      >
        {isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>

      {/* Text Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? "Listening..." : "Ask anything..."}
          disabled={isLoading || isListening}
          rows={1}
          className={cn(
            "w-full px-4 py-2.5 bg-input border border-border rounded-xl",
            "text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "resize-none overflow-y-auto text-sm",
            "transition-all duration-200"
          )}
        />
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="h-10 w-10 rounded-xl gradient-bg text-primary-foreground hover:opacity-90 p-0 flex-shrink-0"
      >
        {isLoading ? (
          <Sparkles className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
