import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { getCanvasData, getConnection } from '@/lib/canvasStorage';
import type { CanvasData, CanvasCourse, CanvasAssignment } from '@/types/canvas';

const MAX_HISTORY = 20;
const STORAGE_KEY = 'smart-chat-history';

interface ChatContext {
  courses: CanvasCourse[];
  upcomingAssignments: CanvasAssignment[];
  grades: Record<string, number>;
  totalAssignments: number;
}

export function useSmartChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })));
      } catch (e) {
        console.error('Failed to parse chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const toSave = messages.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [messages]);

  // Build context from Canvas and localStorage data
  const buildContext = useCallback((): ChatContext | null => {
    const canvasData = getCanvasData();
    if (!canvasData) return null;

    const courses = canvasData.courses || [];
    const allAssignments: CanvasAssignment[] = [];
    
    Object.values(canvasData.assignments || {}).forEach((courseAssignments) => {
      allAssignments.push(...courseAssignments);
    });

    // Get upcoming assignments (next 7 days)
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingAssignments = allAssignments
      .filter(a => {
        if (!a.due_at) return false;
        const dueDate = new Date(a.due_at);
        return dueDate >= now && dueDate <= weekFromNow;
      })
      .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

    // Mock grades for context (in real app, would come from Canvas)
    const grades: Record<string, number> = {};
    courses.forEach(course => {
      grades[course.name] = Math.floor(Math.random() * 15) + 85; // Random grade 85-100 for demo
    });

    return {
      courses,
      upcomingAssignments,
      grades,
      totalAssignments: allAssignments.length,
    };
  }, []);

  // Format context for AI prompt
  const formatContextForAI = useCallback((context: ChatContext | null): string => {
    if (!context) {
      return 'Note: No Canvas data available. The student has not connected their Canvas account.';
    }

    const coursesStr = context.courses.map(c => 
      `- ${c.name} (${c.course_code})`
    ).join('\n');

    const assignmentsStr = context.upcomingAssignments.slice(0, 5).map(a => {
      const course = context.courses.find(c => c.id === a.course_id);
      const dueDate = new Date(a.due_at!);
      const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return `- "${a.name}" (${course?.name || 'Unknown'}) - Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} (${a.points_possible} pts)`;
    }).join('\n');

    const gradesStr = Object.entries(context.grades).map(([course, grade]) => 
      `- ${course}: ${grade}%`
    ).join('\n');

    return `
STUDENT CONTEXT:
================
Enrolled Courses:
${coursesStr || '(No courses)'}

Upcoming Assignments (Next 7 Days):
${assignmentsStr || '(No upcoming assignments)'}

Current Grades:
${gradesStr || '(No grades available)'}

Total Assignments: ${context.totalAssignments}
`;
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    setError(null);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = buildContext();
      const contextStr = formatContextForAI(context);

      // Prepare conversation history (last 10 messages for context)
      const recentHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await supabase.functions.invoke('chat', {
        body: {
          messages: [...recentHistory, { role: 'user', content }],
          context: contextStr,
          isSmartChat: true,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get response');
      }

      const aiContent = response.data?.content || response.data?.response || 
        "I'm sorry, I couldn't generate a response. Please try again.";

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages, buildContext, formatContextForAI]);

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Voice input using Web Speech API
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input is not supported in your browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Export chat as note
  const exportChat = useCallback(() => {
    const content = messages.map(m => 
      `[${m.role.toUpperCase()}] ${m.content}`
    ).join('\n\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  // Get suggested prompts based on context
  const getSuggestedPrompts = useCallback((): string[] => {
    const context = buildContext();
    const prompts = [
      "What's due this week?",
      "What should I work on first?",
      "Study plan for today",
    ];

    if (context && context.courses.length > 0) {
      prompts.push(`How am I doing in ${context.courses[0].name}?`);
    }
    
    if (context && context.upcomingAssignments.length > 0) {
      prompts.push(`Help me with "${context.upcomingAssignments[0].name}"`);
    }

    return prompts;
  }, [buildContext]);

  return {
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
    hasContext: buildContext() !== null,
  };
}
