export function predictState(context) {
  const input = context.input.toLowerCase();
  
  if (input.includes("latest") || input.includes("news")) {
    return {
      intent: "search",
      confidence: 0.9,
      useTools: true,
      needsClarification: false,
      plannedActionType: "search_web"
    };
  }
  
  if (input.includes("what is") || input.includes("explain")) {
    return {
      intent: "answer",
      confidence: 0.85,
      useTools: false,
      needsClarification: false,
      plannedActionType: "respond"
    };
  }
  
  return {
    intent: "clarify",
    confidence: 0.4,
    useTools: false,
    needsClarification: true,
    plannedActionType: "ask_user"
  };
}
