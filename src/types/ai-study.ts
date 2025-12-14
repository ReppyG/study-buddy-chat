// AI Study features types

export interface AISummary {
  id: string;
  assignmentId?: number;
  type: 'assignment' | 'reading';
  originalText: string;
  summary: {
    mainObjective?: string;
    keyRequirements?: string[];
    gradingCriteria?: string[];
    estimatedTime?: string;
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    mainIdeas?: string[];
    keyConcepts?: string[];
    importantDetails?: string[];
    summaryParagraph?: string;
  };
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface Quiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: string;
  createdAt: string;
}

export interface StudyPlanDay {
  date: string;
  tasks: {
    id: string;
    title: string;
    assignmentId?: number;
    duration: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    type: 'study' | 'break' | 'review';
  }[];
}

export interface StudyPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  days: StudyPlanDay[];
  assignments: number[];
  createdAt: string;
}

export interface ConceptExplanation {
  id: string;
  concept: string;
  explanation: string;
  examples: string[];
  analogy?: string;
  simplifiedVersions: string[];
  createdAt: string;
}

export interface AIUsage {
  date: string;
  count: number;
  limit: number;
}

export type AIStudyAction = 
  | 'summarize_assignment'
  | 'summarize_reading'
  | 'generate_questions'
  | 'create_study_plan'
  | 'explain_concept'
  | 'simplify_more';
