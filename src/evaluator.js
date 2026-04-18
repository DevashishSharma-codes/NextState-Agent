export function evaluateTransition(predictedState, observedState) {
  return {
    intentMatch: predictedState.intent === observedState.intent,
    actionMatch: predictedState.plannedActionType === observedState.plannedActionType,
    clarificationMatch: predictedState.needsClarification === observedState.needsClarification,
    confidenceError: Math.abs(predictedState.confidence - observedState.confidence)
  };
}
