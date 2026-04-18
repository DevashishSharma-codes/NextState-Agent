import { ChatOpenAI } from "@langchain/openai";
import { TavilySearch } from "@langchain/tavily";

export async function executeAction(action, context) {
  try {
    // Handle clarification requests
    if (action.type === "ask_user") {
      return {
        success: true,
        output: "Can you clarify your question?",
        toolUsed: null,
      };
    }

    // Validate OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        output: "Missing OPENAI_API_KEY. Please add it to your .env file.",
        toolUsed: null,
      };
    }

    // Create LLM
    const llm = new ChatOpenAI({
      model: "gpt-3.5-turbo",
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Handle Web Search
    if (action.type === "search_web") {
      if (!process.env.TAVILY_API_KEY) {
        return {
          success: false,
          output: "Missing TAVILY_API_KEY. Please add it to your .env file.",
          toolUsed: null,
        };
      }

      const query = context?.input?.trim();

      if (!query) {
        return {
          success: false,
          output: "No search query provided.",
          toolUsed: null,
        };
      }

      const searchTool = new TavilySearch({
        maxResults: 3,
        tavilyApiKey: process.env.TAVILY_API_KEY,
        topic: "general",
      });

      const searchResult = await searchTool.invoke({
        query: query,
      });

      const searchSystemPrompt = `
You are a factual answer synthesis assistant.

Your job is to answer the user's question using the provided web search results.

Rules:
1. Use the search results as your primary evidence.
2. Do not simply list websites unless the user explicitly asks for sources.
3. Extract the most relevant facts, developments, or findings from the search results.
4. Prefer concrete information over generic summaries.
5. If the search results are weak, generic, or insufficient, say that clearly.
6. Do not invent facts that are not supported by the search results.
7. If multiple results overlap, combine them into one clean answer instead of repeating them.
8. Keep the answer clear, concise, and useful.
9. If the user asks for "latest", "current", or "recent" information, focus on the most recent-looking relevant content from the provided results.
10. End with a short "Sources:" line listing 1-3 source titles or URLs only if useful.

Your goal is not to describe the search results.
Your goal is to answer the user's question based on the search results.
`;

      const searchUserPrompt = `
User question:
${query}

Search results:
${JSON.stringify(searchResult, null, 2)}

Now answer the user's question using the search results.
If the results are too weak or too generic, say so briefly.
`;

      const response = await llm.invoke([
        { role: "system", content: searchSystemPrompt },
        { role: "human", content: searchUserPrompt },
      ]);

      return {
        success: true,
        output:
          typeof response.content === "string"
            ? response.content
            : JSON.stringify(response.content),
        toolUsed: "tavily_search",
        rawToolResult: searchResult,
      };
    }

    // Direct Answer (No Tool Needed)
    const directSystemPrompt = `
You are a helpful and accurate assistant.

Your job is to answer the user's question directly when no external tool is needed.

Rules:
1. Answer clearly and concisely.
2. Focus only on the user's actual question.
3. Do not add unrelated information.
4. If the question is ambiguous, say what is unclear instead of pretending certainty.
5. If you are unsure, say so briefly rather than inventing facts.
6. Prefer simple, precise explanations over overly fancy wording.
7. If the user asks an explanatory question, give a structured and understandable answer.
8. If the question can be answered in a few sentences, do not over-expand.

Your goal is to provide a direct, useful, and accurate response.
`;

    const directUserPrompt = `
Question:
${context?.input || ""}
`;

    const response = await llm.invoke([
      { role: "system", content: directSystemPrompt },
      { role: "human", content: directUserPrompt },
    ]);

    return {
      success: true,
      output:
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content),
      toolUsed: null,
    };
  } catch (error) {
    console.error("Action execution failed:", error);

    return {
      success: false,
      output: null,
      error: error.message || "Something went wrong.",
    };
  }
}