/*
  CHAT CONTAINER COMPONENT
  ========================
  This is the main chat interface that brings everything together!
  
  It manages:
  - The list of messages (conversation history)
  - Sending messages to the AI
  - Displaying responses
  - Loading and error states
  - Auto-scrolling to new messages
  
  This component uses React hooks:
  - useState: To store and update data
  - useEffect: To run code when things change
  - useRef: To reference DOM elements (for scrolling)
*/

import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import { Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ChatContainer() {
  // STATE MANAGEMENT
  // ----------------
  // messages: Array of all chat messages
  const [messages, setMessages] = useState<Message[]>([]);
  // isLoading: True when waiting for AI response
  const [isLoading, setIsLoading] = useState(false);
  // error: Stores any error message to display
  const [error, setError] = useState<string | null>(null);

  // REFS
  // ----
  // Reference to the messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AUTO-SCROLL EFFECT
  // ------------------
  // Scrolls to the bottom whenever new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // SEND MESSAGE FUNCTION
  // ---------------------
  // This function handles sending a message to the AI
  const sendMessage = async (content: string) => {
    // Clear any previous errors
    setError(null);

    // Create the user message object
    const userMessage: Message = {
      id: crypto.randomUUID(), // Generate unique ID
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    
    // Show loading state
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      // We send all previous messages so the AI has context
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call our backend function that talks to the AI
      const response = await supabase.functions.invoke('chat', {
        body: { messages: conversationHistory },
      });

      // Check for errors
      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }

      // Extract the AI's response
      const aiContent = response.data?.content || response.data?.response || 
        "I'm sorry, I couldn't generate a response. Please try again.";

      // Create the AI message object
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };

      // Add AI message to the chat
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      // Handle any errors
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Always turn off loading state
      setIsLoading(false);
    }
  };

  // CLEAR CHAT FUNCTION
  // -------------------
  const clearChat = () => {
    setMessages([]);
    setError(null);
    toast.success('Chat cleared!');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Logo with gradient */}
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">Study Buddy AI</h1>
            <p className="text-xs text-muted-foreground">Your personal study assistant</p>
          </div>
        </div>
        
        {/* Clear chat button */}
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Empty state - shown when there are no messages */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 animate-pulse-glow">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-semibold gradient-text mb-2">
                Hey there! 👋
              </h2>
              <p className="text-muted-foreground max-w-md">
                I'm your Study Buddy AI. Ask me anything about homework, studying, 
                or just chat! I'm here to help you succeed. 📚✨
              </p>
              
              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {[
                  "Help me with math homework",
                  "Explain photosynthesis",
                  "Study tips for exams",
                  "Write a poem about science"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="
                      px-4 py-2 rounded-full text-sm
                      bg-secondary text-secondary-foreground
                      hover:bg-primary hover:text-primary-foreground
                      transition-colors duration-200
                      border border-border
                    "
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-slide-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing indicator - shown while AI is thinking */}
          {isLoading && <TypingIndicator />}

          {/* Invisible element for auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* INPUT AREA */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
