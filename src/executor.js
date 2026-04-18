export async function executeAction(action, context) {
  if (action.type === "search_web") {
    return {
      success: true,
      output: `Pretend search results for: ${context.input}`
    };
  }
  
  if (action.type === "ask_user") {
    return {
      success: true,
      output: "Can you clarify your question?"
    };
  }
  
  // action.type === "respond_directly"
  return {
    success: true,
    output: `Direct answer for: ${context.input}`
  };
}
