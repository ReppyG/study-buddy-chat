/*
  MOTIVATIONAL MESSAGE EDGE FUNCTION
  ===================================
  When students complete a Pomodoro session, this generates
  an encouraging message to keep them motivated!
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
    const { sessionCount, totalMinutes, isBreak } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating motivational message for session:", sessionCount);

    // Create a context-aware prompt
    const prompt = isBreak 
      ? `Generate a short, fun message (2-3 sentences) for a high school student who just finished a ${totalMinutes || 5} minute break. Encourage them to get back to studying. Include 1-2 relevant emojis. Be encouraging and relatable to teens.`
      : `Generate a motivational message (2-3 sentences) for a high school student who just completed study session #${sessionCount} today (${totalMinutes} total minutes studied). Include 2-3 relevant emojis. Be encouraging, fun, and relatable to teenagers. Mention their progress if they've done multiple sessions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an encouraging study buddy for high school students. Keep messages short, positive, and use teen-friendly language. Always include emojis."
          },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ message: "Great job completing your session! 🎉 Keep up the amazing work! 💪" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Amazing work! Keep it up! 🌟";

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Motivation function error:", error);
    // Return a fallback message on error
    return new Response(
      JSON.stringify({ message: "You did it! Another session complete! 🎉 Keep crushing it! 💪" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
