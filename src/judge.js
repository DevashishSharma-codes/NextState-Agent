import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export async function judgeRun({ input, predictedState, action, result, observedState }) {
  const defaultOutput = {
    relevanceScore: 0.5,
    groundingScore: 0.5,
    actionAppropriatenessScore: 0.5,
    overallJudgeScore: 0.5,
    judgedAppropriateAction: "respond",
    reason: "Judge evaluation failed or fell back to defaults."
  };

  try {
    if (!process.env.OPENAI_API_KEY) {
      return defaultOutput;
    }

    const llm = new ChatOpenAI({
      model: "gpt-3.5-turbo",
      temperature: 0.0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const judgeSchema = z.object({
      relevanceScore: z.number().min(0).max(1),
      groundingScore: z.number().min(0).max(1),
      actionAppropriatenessScore: z.number().min(0).max(1),
      overallJudgeScore: z.number().min(0).max(1),
      judgedAppropriateAction: z.enum(["respond", "search_web", "ask_user"]),
      reason: z.string(),
    });

    const structuredLlm = llm.withStructuredOutput(judgeSchema);

    const prompt = `
You are evaluating an agent run over a user's question.

User Input: "${input}"

Predicted State by Agent:
${JSON.stringify(predictedState, null, 2)}

Action Taken by Agent:
${JSON.stringify(action, null, 2)}

Final Answer (Result Output):
${result?.output || "None"}

Raw Tool Evidence:
${result?.rawToolResult ? JSON.stringify(result.rawToolResult).substring(0, 500) + '...' : 'None'}

Please evaluate:
1. relevanceScore: How well the final answer addressed the question.
2. groundingScore: How well supported it is by evidence (if no tools, judge standard accuracy).
3. actionAppropriatenessScore: Whether the chosen action was the right kind of action.
4. overallJudgeScore: Overall run quality from 0 to 1.
5. judgedAppropriateAction: Which action should have been taken ("respond", "search_web", "ask_user").
6. reason: Short explanation.
`;

    const evaluation = await structuredLlm.invoke(prompt);
    
    const clamp = (v) => Math.max(0, Math.min(1, v));
    return {
      relevanceScore: clamp(evaluation.relevanceScore),
      groundingScore: clamp(evaluation.groundingScore),
      actionAppropriatenessScore: clamp(evaluation.actionAppropriatenessScore),
      overallJudgeScore: clamp(evaluation.overallJudgeScore),
      judgedAppropriateAction: evaluation.judgedAppropriateAction,
      reason: evaluation.reason
    };

  } catch (error) {
    console.error("Judge run failed:", error);
    return defaultOutput;
  }
}
