import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export async function predictState(context) {
  const input = context.input;
  const lowerInput = input.toLowerCase();

  // Basic old rules for fallback
  const ruleBasedFallback = () => {
    if (lowerInput.includes("latest") || lowerInput.includes("news")) {
      return {
        predictedState: {
          intent: "search",
          useTools: true,
          needsClarification: false,
          plannedActionType: "search_web"
        },
        stateConfidence: 0.85,
        stateReason: "Fallback rule-based prediction used because LLM prediction failed. The words 'latest' or 'news' suggest search."
      };
    }

    if (lowerInput.includes("what is") || lowerInput.includes("explain")) {
      return {
        predictedState: {
          intent: "answer",
          useTools: false,
          needsClarification: false,
          plannedActionType: "respond"
        },
        stateConfidence: 0.80,
        stateReason: "Fallback rule-based prediction used because LLM prediction failed. Input indicates a direct question."
      };
    }

    return {
      predictedState: {
        intent: "clarify",
        useTools: false,
        needsClarification: true,
        plannedActionType: "ask_user"
      },
      stateConfidence: 0.45,
      stateReason: "Fallback rule-based prediction used because LLM prediction failed. Input is ambiguous."
    };
  };

  try {
    if (!process.env.OPENAI_API_KEY) {
      return ruleBasedFallback();
    }

    const llm = new ChatOpenAI({
      model: "gpt-5.4-mini",
      temperature: 0.0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const predictionSchema = z.object({
      predictedState: z.object({
        intent: z.enum(["answer", "search", "clarify"]),
        useTools: z.boolean(),
        needsClarification: z.boolean(),
        plannedActionType: z.enum(["respond", "search_web", "ask_user"])
      }),
      stateConfidence: z.number().min(0).max(1),
      stateReason: z.string()
    });

    const structuredLlm = llm.withStructuredOutput(predictionSchema);

    const prompt = `
You are the routing brain of an AI agent.

Your job:
Given the user input, decide the best next state BEFORE any action is taken.

Allowed intents:
- answer
- search
- clarify

Allowed plannedActionType:
- respond
- search_web
- ask_user

Rules:
- Use search_web for current or time-sensitive information (e.g., latest news).
- Use ask_user for ambiguous or incomplete requests, or requests that make no sense like gibberish.
- Use respond for direct stable questions.

Assign stateConfidence from 0 to 1:
- Higher when one action is clearly best.
- Lower when the request is ambiguous, mixed, vague, extremely short, or uncertain.

Return valid JSON exactly matching the requested format.

User input: "${input}"
`;

    let prediction = await structuredLlm.invoke(prompt);

    // Light Calibration Logic
    let conf = prediction.stateConfidence;

    // 1. Contains pronouns but missing context (input is short)
    const pronouns = /\b(it|that|this|again)\b/i;
    if (pronouns.test(lowerInput) && input.length < 30) {
      conf -= 0.15;
    }

    // 2. Multiple intents (mixed)
    const hasExplain = lowerInput.includes("explain") || lowerInput.includes("what is") || lowerInput.includes("compare");
    const hasSearch = lowerInput.includes("latest") || lowerInput.includes("news") || lowerInput.includes("current");
    if (hasExplain && hasSearch) {
      conf -= 0.15;
    }

    // 3. Extremely short / vague or gibberish
    if (input.trim().length <= 5 || (lowerInput.match(/^[a-z]{6,}$/i) && !lowerInput.includes(" "))) {
      conf -= 0.20;
    }

    // Clamp and round to 2 decimals
    prediction.stateConfidence = Math.max(0, Math.min(1, Number(conf.toFixed(2))));

    return prediction;

  } catch (error) {
    console.error("Predictor LLM failed:", error);
    return ruleBasedFallback();
  }
}
