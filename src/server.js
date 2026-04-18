import express from 'express';
import { predictState } from './predictor.js';
import { selectAction } from './actionSelector.js';
import { executeAction } from './executor.js';
import { observeState } from './observer.js';
import { evaluateTransition } from './evaluator.js';
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
    
    // 2. Call predictor
    const predictedState = predictState(context);
    
    // 3. Call actionSelector
    const action = selectAction(predictedState);
    
    // 4. Call executor
    const result = await executeAction(action, context);
    
    // 5. Call observer
    const observedState = observeState(action, result);
    
    // 6. Call evaluator
    const transitionError = evaluateTransition(predictedState, observedState);
    
    // 7. Build trace object
    const trace = {
      timestamp: new Date().toISOString(),
      input,
      context,
      predictedState,
      action,
      result,
      observedState,
      transitionError
    };
    
    // 8. Save trace
    saveTrace(trace);
    
    // 9. Return JSON response
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
