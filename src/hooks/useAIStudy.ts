// AI Study hook for managing AI features and rate limiting
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  AISummary, 
  Quiz, 
  QuizQuestion, 
  StudyPlan, 
  ConceptExplanation, 
  AIUsage,
  AIStudyAction 
} from '@/types/ai-study';

const DAILY_LIMIT = 50;
const STORAGE_KEYS = {
  usage: 'study_ai_usage',
  summaries: 'study_ai_summaries',
  quizzes: 'study_ai_quizzes',
  studyPlans: 'study_ai_plans',
  explanations: 'study_ai_explanations',
};

export function useAIStudy() {
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState<AIUsage>({ date: '', count: 0, limit: DAILY_LIMIT });

  // Load usage from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEYS.usage);
    
    if (stored) {
      const parsed: AIUsage = JSON.parse(stored);
      if (parsed.date === today) {
        setUsage(parsed);
      } else {
        // Reset for new day
        const newUsage = { date: today, count: 0, limit: DAILY_LIMIT };
        localStorage.setItem(STORAGE_KEYS.usage, JSON.stringify(newUsage));
        setUsage(newUsage);
      }
    } else {
      const newUsage = { date: today, count: 0, limit: DAILY_LIMIT };
      localStorage.setItem(STORAGE_KEYS.usage, JSON.stringify(newUsage));
      setUsage(newUsage);
    }
  }, []);

  // Increment usage
  const incrementUsage = useCallback(() => {
    setUsage(prev => {
      const updated = { ...prev, count: prev.count + 1 };
      localStorage.setItem(STORAGE_KEYS.usage, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Check if can make request
  const canMakeRequest = useCallback(() => {
    if (usage.count >= usage.limit) {
      toast.error(`Daily limit reached (${usage.limit} requests). Try again tomorrow!`);
      return false;
    }
    if (usage.count >= usage.limit - 5) {
      toast.warning(`Only ${usage.limit - usage.count} requests remaining today.`);
    }
    return true;
  }, [usage]);

  // Generic AI request
  const makeAIRequest = useCallback(async (
    action: AIStudyAction,
    content: string,
    options?: Record<string, any>
  ) => {
    if (!canMakeRequest()) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('study-ai', {
        body: { action, content, options },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      incrementUsage();
      return data.data;
    } catch (err: any) {
      console.error('AI request error:', err);
      if (err.message?.includes('RATE_LIMITED')) {
        toast.error('Too many requests. Please wait a moment.');
      } else if (err.message?.includes('CREDITS_EXHAUSTED')) {
        toast.error('AI credits exhausted. Please try again later.');
      } else {
        toast.error(err.message || 'AI request failed');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [canMakeRequest, incrementUsage]);

  // Summarize assignment
  const summarizeAssignment = useCallback(async (
    assignmentText: string,
    assignmentId?: number
  ): Promise<AISummary | null> => {
    const result = await makeAIRequest('summarize_assignment', assignmentText);
    if (!result) return null;

    const summary: AISummary = {
      id: crypto.randomUUID(),
      assignmentId,
      type: 'assignment',
      originalText: assignmentText,
      summary: result,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const stored = localStorage.getItem(STORAGE_KEYS.summaries);
    const summaries: AISummary[] = stored ? JSON.parse(stored) : [];
    summaries.unshift(summary);
    localStorage.setItem(STORAGE_KEYS.summaries, JSON.stringify(summaries.slice(0, 50)));

    return summary;
  }, [makeAIRequest]);

  // Summarize reading
  const summarizeReading = useCallback(async (readingText: string): Promise<AISummary | null> => {
    const result = await makeAIRequest('summarize_reading', readingText);
    if (!result) return null;

    const summary: AISummary = {
      id: crypto.randomUUID(),
      type: 'reading',
      originalText: readingText.slice(0, 500) + '...',
      summary: result,
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.summaries);
    const summaries: AISummary[] = stored ? JSON.parse(stored) : [];
    summaries.unshift(summary);
    localStorage.setItem(STORAGE_KEYS.summaries, JSON.stringify(summaries.slice(0, 50)));

    return summary;
  }, [makeAIRequest]);

  // Generate quiz questions
  const generateQuiz = useCallback(async (
    topic: string,
    questionType: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false',
    questionCount: number
  ): Promise<Quiz | null> => {
    const result = await makeAIRequest('generate_questions', topic, {
      questionType,
      questionCount,
    });
    if (!result?.questions) return null;

    const quiz: Quiz = {
      id: crypto.randomUUID(),
      topic,
      questions: result.questions.map((q: any, i: number) => ({
        id: `q-${i}`,
        ...q,
      })),
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.quizzes);
    const quizzes: Quiz[] = stored ? JSON.parse(stored) : [];
    quizzes.unshift(quiz);
    localStorage.setItem(STORAGE_KEYS.quizzes, JSON.stringify(quizzes.slice(0, 20)));

    return quiz;
  }, [makeAIRequest]);

  // Create study plan
  const createStudyPlan = useCallback(async (
    assignments: any[],
    studyHoursPerDay: number,
    planName: string
  ): Promise<StudyPlan | null> => {
    const result = await makeAIRequest('create_study_plan', '', {
      assignments,
      studyHoursPerDay,
      currentDate: new Date().toISOString().split('T')[0],
    });
    if (!result?.days) return null;

    const dates = result.days.map((d: any) => d.date).sort();
    const plan: StudyPlan = {
      id: crypto.randomUUID(),
      name: planName,
      startDate: dates[0],
      endDate: dates[dates.length - 1],
      days: result.days.map((d: any) => ({
        ...d,
        tasks: d.tasks.map((t: any, i: number) => ({
          id: `task-${i}`,
          completed: false,
          ...t,
        })),
      })),
      assignments: assignments.map(a => a.id),
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.studyPlans);
    const plans: StudyPlan[] = stored ? JSON.parse(stored) : [];
    plans.unshift(plan);
    localStorage.setItem(STORAGE_KEYS.studyPlans, JSON.stringify(plans.slice(0, 10)));

    return plan;
  }, [makeAIRequest]);

  // Explain concept
  const explainConcept = useCallback(async (concept: string): Promise<ConceptExplanation | null> => {
    const result = await makeAIRequest('explain_concept', concept);
    if (!result) return null;

    const explanation: ConceptExplanation = {
      id: crypto.randomUUID(),
      concept,
      explanation: result.explanation,
      examples: result.examples || [],
      analogy: result.analogy,
      simplifiedVersions: [],
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.explanations);
    const explanations: ConceptExplanation[] = stored ? JSON.parse(stored) : [];
    explanations.unshift(explanation);
    localStorage.setItem(STORAGE_KEYS.explanations, JSON.stringify(explanations.slice(0, 30)));

    return explanation;
  }, [makeAIRequest]);

  // Simplify explanation further
  const simplifyMore = useCallback(async (
    concept: string,
    previousExplanation: string
  ): Promise<{ explanation: string; examples: string[]; analogy?: string } | null> => {
    const result = await makeAIRequest('simplify_more', concept, { previousExplanation });
    return result;
  }, [makeAIRequest]);

  // Get saved data
  const getSavedSummaries = useCallback((): AISummary[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.summaries);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const getSavedQuizzes = useCallback((): Quiz[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.quizzes);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const getSavedStudyPlans = useCallback((): StudyPlan[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.studyPlans);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const getSavedExplanations = useCallback((): ConceptExplanation[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.explanations);
    return stored ? JSON.parse(stored) : [];
  }, []);

  return {
    isLoading,
    usage,
    summarizeAssignment,
    summarizeReading,
    generateQuiz,
    createStudyPlan,
    explainConcept,
    simplifyMore,
    getSavedSummaries,
    getSavedQuizzes,
    getSavedStudyPlans,
    getSavedExplanations,
  };
}
