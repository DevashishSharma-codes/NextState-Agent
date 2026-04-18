export function evaluateTransition(predictedState, stateConfidence, observedState) {
  const error = Math.abs(stateConfidence - observedState.observedDecisionScore);
  return {
    intentMatch: predictedState.intent === observedState.intent,
    actionMatch: predictedState.plannedActionType === observedState.plannedActionType,
    clarificationMatch: predictedState.needsClarification === observedState.needsClarification,
    decisionScoreDelta: Number(error.toFixed(2))
  };
}
