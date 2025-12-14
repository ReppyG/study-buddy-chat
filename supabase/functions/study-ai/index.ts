// AI Study edge function - handles all AI study features
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudyAIRequest {
  action: string;
  content: string;
  options?: {
    questionType?: string;
    questionCount?: number;
    assignments?: any[];
    studyHoursPerDay?: number;
    currentDate?: string;
    previousExplanation?: string;
  };
}

const PROMPTS = {
  summarize_assignment: (content: string) => `
You are a helpful study assistant for high school students. Summarize this assignment clearly and concisely.

Extract and format as JSON:
{
  "mainObjective": "What the student needs to do (1-2 sentences)",
  "keyRequirements": ["Requirement 1", "Requirement 2", ...],
  "gradingCriteria": ["Criterion 1", "Criterion 2", ...],
  "estimatedTime": "X hours/minutes",
  "difficulty": "Easy" | "Medium" | "Hard"
}

Assignment text:
${content}

Respond ONLY with valid JSON, no markdown or extra text.`,

  summarize_reading: (content: string) => `
You are a helpful study assistant for high school students. Summarize this reading material clearly.

Extract and format as JSON:
{
  "mainIdeas": ["Main idea 1", "Main idea 2", ... (3-5 bullet points)],
  "keyConcepts": ["Concept: Definition", ...],
  "importantDetails": ["Important person, date, or event 1", ...],
  "summaryParagraph": "3-5 sentence summary"
}

Reading material:
${content}

Respond ONLY with valid JSON, no markdown or extra text.`,

  generate_questions: (content: string, type: string, count: number) => `
You are a high school teacher creating practice questions. Generate exactly ${count} ${type.replace('_', ' ')} questions.

Topic/Content:
${content}

Format as JSON array:
{
  "questions": [
    {
      "question": "Question text",
      "type": "${type}",
      ${type === 'multiple_choice' ? '"options": ["A) ...", "B) ...", "C) ...", "D) ..."],' : ''}
      ${type === 'true_false' ? '"options": ["True", "False"],' : ''}
      "correctAnswer": "The correct answer",
      "explanation": "Why this is correct"
    }
  ]
}

Respond ONLY with valid JSON, no markdown or extra text.`,

  create_study_plan: (assignments: any[], hoursPerDay: number, currentDate: string) => `
You are a study planner for a high school student. Create a detailed study plan.

Assignments:
${JSON.stringify(assignments, null, 2)}

Available study time: ${hoursPerDay} hours per day
Current date: ${currentDate}

Create a day-by-day plan as JSON:
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "Task description",
          "assignmentId": null or assignment ID,
          "duration": "X minutes",
          "priority": "high" | "medium" | "low",
          "type": "study" | "break" | "review"
        }
      ]
    }
  ]
}

Include:
1. Prioritize by urgency and difficulty
2. Specific tasks for each day
3. Break times (5-10 min breaks)
4. Time estimates per task
5. Review sessions before due dates

Respond ONLY with valid JSON, no markdown or extra text.`,

  explain_concept: (concept: string) => `
You are a friendly tutor explaining concepts to a high school student. Make it simple and relatable.

Concept to explain: ${concept}

Format as JSON:
{
  "explanation": "Clear, simple explanation (2-3 paragraphs)",
  "examples": ["Real-world example 1 relevant to teens", "Example 2", "Example 3"],
  "analogy": "A relatable analogy (like comparing to something familiar)"
}

Use simple language, avoid jargon, and make it engaging for teenagers.

Respond ONLY with valid JSON, no markdown or extra text.`,

  simplify_more: (concept: string, previousExplanation: string) => `
The student didn't fully understand this explanation. Make it EVEN SIMPLER.

Concept: ${concept}
Previous explanation: ${previousExplanation}

Format as JSON:
{
  "explanation": "Ultra-simple explanation using everyday words",
  "examples": ["Very basic example 1", "Very basic example 2"],
  "analogy": "Simple analogy a child could understand"
}

Use the simplest possible language. Think "explain it like I'm 10 years old."

Respond ONLY with valid JSON, no markdown or extra text.`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { action, content, options = {} }: StudyAIRequest = await req.json();
    console.log(`Study AI action: ${action}`);

    let prompt: string;

    switch (action) {
      case 'summarize_assignment':
        prompt = PROMPTS.summarize_assignment(content);
        break;
      case 'summarize_reading':
        prompt = PROMPTS.summarize_reading(content);
        break;
      case 'generate_questions':
        prompt = PROMPTS.generate_questions(
          content,
          options.questionType || 'multiple_choice',
          options.questionCount || 5
        );
        break;
      case 'create_study_plan':
        prompt = PROMPTS.create_study_plan(
          options.assignments || [],
          options.studyHoursPerDay || 3,
          options.currentDate || new Date().toISOString().split('T')[0]
        );
        break;
      case 'explain_concept':
        prompt = PROMPTS.explain_concept(content);
        break;
      case 'simplify_more':
        prompt = PROMPTS.simplify_more(content, options.previousExplanation || '');
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are Study Buddy AI, a helpful study assistant for high school students. Always respond with valid JSON only, no markdown formatting or extra text.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.', code: 'RATE_LIMITED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.', code: 'CREDITS_EXHAUSTED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse and validate JSON response
    let parsedResponse;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.slice(7);
      }
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.slice(3);
      }
      if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.slice(0, -3);
      }
      parsedResponse = JSON.parse(cleanResponse.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Return raw response if JSON parsing fails
      parsedResponse = { raw: aiResponse };
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Study AI error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
