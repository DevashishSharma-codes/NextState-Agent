import 'dotenv/config';
import express from 'express';
import { predictState } from './predictor.js';
import { selectAction } from './actionSelector.js';
import { executeAction } from './executor.js';
import { observeState } from './observer.js';
import { evaluateTransition } from './evaluator.js';
import { scoreRetrieval } from './retrievalScorer.js';
import { judgeRun } from './judge.js';
import { calculateFinalConfidence } from './confidenceCalculator.js';
import { saveTrace } from './traceStore.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Next-state agent is running');
});

app.post('/run-agent', async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input is required and must be a string' });
    }
    
    // 1. Build context
    const context = { input };
    
    // 2. Call predictor (Now async)
    const predictionResult = await predictState(context);
    const { predictedState, stateConfidence, stateReason } = predictionResult;
    
    // 3. Call actionSelector
    const action = selectAction(predictedState);
    
    let result, observedState, transitionError, trace;
    let retrievalEvaluation = { retrievalQuality: null, retrievalQualityReason: null };
    let judgeEvaluation = { 
      relevanceScore: 0.5, groundingScore: 0.5, actionAppropriatenessScore: 0.5, 
      overallJudgeScore: 0.5, judgedAppropriateAction: "respond", 
      reason: "Judge skipped or failed" 
    };
    let confidenceResult = {};

    try {
      // 4. Call executor
      result = await executeAction(action, context);
      
      // 5. Call observer
      observedState = observeState(action, result);
      
      // 6. Call evaluator (structural)
      transitionError = evaluateTransition(predictedState, stateConfidence, observedState);

      // 7. Call retrieval scorer
      retrievalEvaluation = scoreRetrieval(result, action);

      // 8. Call judge
      judgeEvaluation = await judgeRun({ input, predictedState, action, result, observedState });

      // 9. Call confidence calculator
      confidenceResult = calculateFinalConfidence({
        predictedState,
        action,
        stateConfidence,
        stateReason,
        retrievalQuality: retrievalEvaluation.retrievalQuality,
        retrievalQualityReason: retrievalEvaluation.retrievalQualityReason,
        judgeEvaluation
      });

    } catch (e) {
      console.error("Pipeline failed partially:", e);
      result = result || { success: false, output: null, error: e.message };
      observedState = observedState || observeState(action, result);
      transitionError = transitionError || evaluateTransition(predictedState, stateConfidence, observedState);
      
      confidenceResult = calculateFinalConfidence({
        predictedState,
        action,
        stateConfidence,
        stateReason,
        retrievalQuality: retrievalEvaluation.retrievalQuality,
        retrievalQualityReason: retrievalEvaluation.retrievalQualityReason,
        judgeEvaluation
      });
    }

    // 10. Build trace object
    trace = {
      timestamp: new Date().toISOString(),
      input,
      context,
      predictedState,
      stateConfidence,
      stateReason,
      action,
      result,
      observedState,
      transitionError,
      judgeEvaluation,
      scoreBreakdown: confidenceResult.scoreBreakdown || {},
      scoreReasons: confidenceResult.scoreReasons || {}
    };
    
    // 11. Save trace
    saveTrace(trace);
    
    // 12. Return JSON response
    res.json({
      message: 'Agent run complete',
      response: result.output,
      trace
    });
    
  } catch (error) {
    console.error('Error running agent:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
