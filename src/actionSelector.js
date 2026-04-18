export function selectAction(predictedState) {
  if (predictedState.plannedActionType === "search_web") {
    return { type: "search_web" };
  }
  
  if (predictedState.plannedActionType === "ask_user") {
    return { type: "ask_user" };
  }
  
  return { type: "respond_directly" };
}
