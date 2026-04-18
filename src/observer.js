export function observeState(action, result) {
  if (action.type === "search_web") {
    return {
      intent: "search",
      observedDecisionScore: result.success ? 0.8 : 0.3,
      useTools: true,
      needsClarification: false,
      plannedActionType: "search_web"
    };
  }
  
  if (action.type === "ask_user") {
    return {
      intent: "clarify",
      observedDecisionScore: 0.7,
      useTools: false,
      needsClarification: true,
      plannedActionType: "ask_user"
    };
  }
  
  // action.type === "respond_directly"
  return {
    intent: "answer",
    observedDecisionScore: result.success ? 0.8 : 0.3,
    useTools: false,
    needsClarification: false,
    plannedActionType: "respond"
  };
}
