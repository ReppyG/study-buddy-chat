/*
  SMART CHAT EDGE FUNCTION
  ========================
  Enhanced chat with context awareness for study assistance.
  
  This function:
  1. Receives messages and optional context (Canvas data, assignments, grades)
  2. Builds a contextual prompt with student information
  3. Sends to Lovable AI Gateway (Gemini)
  4. Returns personalized responses
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context, isSmartChat } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Smart chat request:", { 
      messageCount: messages.length, 
      hasContext: !!context,
      isSmartChat 
    });

    // Build system prompt based on whether we have context
    const systemPrompt = isSmartChat && context ? `You are Study Buddy AI, an intelligent study assistant for high school students.

IMPORTANT INSTRUCTIONS:
- You have access to the student's Canvas LMS data below
- When asked about assignments, grades, or courses, USE THIS DATA to give specific, accurate answers
- Be encouraging, friendly, and use emojis occasionally 📚✨
- Give practical, actionable advice
- When suggesting what to work on, consider due dates, points, and difficulty
- If asked about specific assignments or grades, cite the data you have
- Keep responses concise but helpful

${context}

RESPONSE GUIDELINES:
- For "what's due" questions: List specific assignments with dates and courses
- For "what should I work on" questions: Prioritize by urgency and importance
- For grade questions: Reference specific courses and percentages
- For study help: Be encouraging and provide clear explanations
- For flashcard/quiz requests: Create interactive content
- Always be supportive and motivating!` 
    : `You are Study Buddy AI, a friendly and helpful AI assistant designed for high school students. 
            
Your personality:
- Encouraging and supportive
- Explain concepts in simple terms
- Use emojis occasionally to be friendly 📚✨
- Break down complex topics step by step
- Give examples that relate to everyday life
- If you don't know something, be honest about it

Your capabilities:
- Help with homework across all subjects
- Explain difficult concepts
- Provide study tips and techniques
- Help brainstorm ideas for projects
- Answer general knowledge questions
- Encourage good study habits

Remember: You're talking to teenagers, so be relatable but always respectful and educational!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    // Check if the AI request was successful
    if (!response.ok) {
      // Handle rate limiting (too many requests)
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests! Please wait a moment and try again." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Handle payment required (out of credits)
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Log and return other errors
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Parse the AI response
    const data = await response.json();
    
    // Extract the actual message content from the response
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    console.log("AI responded successfully");

    // Return the AI's response to the frontend
    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    // Log and handle any errors
    console.error("Chat function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Something went wrong. Please try again!" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
