import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are an expert NLP emotion detection model and a warm, supportive friend. Analyze the emotional content of text and return scores for each emotion as percentages (0-100) that sum to 100. Identify the dominant emotion, write a brief 1-sentence insight about the emotional tone, and craft a personalized 1-2 sentence compliment or kind message that acknowledges the writer's feelings and uplifts them. Adapt the compliment's tone to the emotion (celebrate joy, comfort sadness, validate anger, soothe fear, etc.).",
          },
          { role: "user", content: `Analyze the emotions in this text:\n\n"""${text}"""` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_emotions",
              description: "Report emotion analysis results",
              parameters: {
                type: "object",
                properties: {
                  dominant: {
                    type: "string",
                    enum: ["joy", "sadness", "anger", "fear", "surprise", "love", "neutral"],
                  },
                  insight: { type: "string", description: "One short sentence about the emotional tone" },
                  compliment: {
                    type: "string",
                    description:
                      "A warm, personalized 1-2 sentence compliment or kind message tailored to the dominant emotion and the text's content.",
                  },
                  emotions: {
                    type: "object",
                    properties: {
                      joy: { type: "number" },
                      sadness: { type: "number" },
                      anger: { type: "number" },
                      fear: { type: "number" },
                      surprise: { type: "number" },
                      love: { type: "number" },
                      neutral: { type: "number" },
                    },
                    required: ["joy", "sadness", "anger", "fear", "surprise", "love", "neutral"],
                    additionalProperties: false,
                  },
                },
                required: ["dominant", "insight", "compliment", "emotions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_emotions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (response.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await response.text();
      console.error("Gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");
    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("detect-emotion error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
