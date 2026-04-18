export function calculateFinalConfidence({
  predictedState,
  action,
  stateConfidence,
  stateReason,
  retrievalQuality,
  retrievalQualityReason,
  judgeEvaluation
}) {
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const sConf = stateConfidence || 0;
  const jScore = judgeEvaluation?.overallJudgeScore || 0;
  const rQual = retrievalQuality !== null && retrievalQuality !== undefined ? retrievalQuality : null;

  let agreementScore = 0.3;
  let agreementReason = "The predicted action did NOT match the judged appropriate action.";
  
  if (predictedState.plannedActionType === judgeEvaluation?.judgedAppropriateAction) {
    agreementScore = 0.9;
    agreementReason = "The predicted action correctly matched the judged appropriate action.";
  }

  let finalTScore = 0;

  if (action?.type === "search_web") {
    // Search path formula
    finalTScore = (0.25 * sConf) + (0.25 * (rQual || 0)) + (0.40 * jScore) + (0.10 * agreementScore);
  } else if (action?.type === "ask_user") {
    // Clarify path formula
    finalTScore = (0.60 * sConf) + (0.40 * jScore);
  } else {
    // Direct answer path formula
    finalTScore = (0.35 * sConf) + (0.50 * jScore) + (0.15 * agreementScore);
  }

  finalTScore = clamp(Number(finalTScore.toFixed(2)));
  agreementScore = clamp(Number(agreementScore.toFixed(2)));

  return {
    agreementScore,
    agreementReason,
    finalTrustScore: finalTScore,
    scoreBreakdown: {
      stateConfidence: sConf,
      retrievalQuality: rQual,
      judgeScore: jScore,
      agreementScore,
      finalTrustScore: finalTScore
    },
    scoreReasons: {
      stateReason: stateReason || "No state reason provided.",
      retrievalQualityReason: retrievalQualityReason || "No retrieval score computed.",
      judgeReason: judgeEvaluation?.reason || "No judge reason provided.",
      agreementReason
    }
  };
}
