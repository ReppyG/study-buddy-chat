/*
  CHAT EDGE FUNCTION
  ==================
  This is the backend code that talks to the AI!
  
  Edge functions run on the server (not in the browser), which is important
  because we need to keep our API key secret. Never expose API keys in frontend code!
  
  How it works:
  1. Receives messages from the frontend
  2. Sends them to the AI (Gemini via Lovable AI Gateway)
  3. Returns the AI's response
  
  This function uses Lovable AI Gateway, which provides Gemini AI models.
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers allow our frontend to call this function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests (browsers send these before actual requests)
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the messages from the request body
    const { messages } = await req.json();

    // Get the API key from environment variables (stored securely)
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Log for debugging (you can see this in the Edge Function logs)
    console.log("Received chat request with", messages.length, "messages");

    // Call the Lovable AI Gateway (which uses Gemini under the hood!)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Using Gemini 2.5 Flash - fast and smart!
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are Study Buddy AI, a friendly and helpful AI assistant designed for high school students. 
            
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

Remember: You're talking to teenagers, so be relatable but always respectful and educational!`
          },
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
