# next-state-agent

A Node.js + Express backend project that acts as a real next-state predictive agent using LangChain, OpenAI, and Tavily for live web search.

## Overview

The agent performs a sequence of operations to handle an input:

1. **Predicts** the next internal state based on user input.
2. **Selects** an action based on the predicted state.
3. **Executes** the action (using real OpenAI chat models and Tavily search).
4. **Infers** an observed state from the executed action's result.
5. **Computes** a transition error comparing predicted state with observed state.
6. **Saves** a structured trace log.

All traces are automatically stored locally as JSON lines in `traces/traces.jsonl`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Environment Setup:

Copy the `.env.example` to `.env` and fill in your real API keys:

```bash
cp .env.example .env
```

`.env` should contain:
```
OPENAI_API_KEY=your_openai_key
TAVILY_API_KEY=your_tavily_key
PORT=3000
```

3. Start the server:

```bash
npm start
```

The server runs on `http://localhost:3000`.

## API Endpoint & Postman Testing

### POST `/run-agent`

Send JSON with an `input` strictly matching a string.

**How to test in Postman:**

1. Open Postman.
2. Create a new **POST** request.
3. URL: `http://localhost:3000/run-agent`
4. Go to **Headers**:
   * `Content-Type: application/json`
5. Go to **Body > raw > JSON**.
6. Paste one of the examples below and click **Send**.

### Example 1: Predict Respond Directly
```json
{ "input": "Explain machine learning" }
```

### Example 2: Predict Search Web
```json
{ "input": "Give me latest AI news" }
```

### Example 3: Predict Ask User
```json
{ "input": "Help me" }
```

## Dynamic Confidence Scoring

In earlier iterations, this agent used static/hardcoded confidence scores. Now, it employs a **dynamic confidence system**, composed of four parts. Note that not every score is technically a "confidence"; `stateConfidence` remains a confidence because it represents a pre-action state decision probability, while the others are better understood as quality or evaluation scores.

1. **State Confidence**: How sure the agent is, before acting, that its chosen next move is correct. 
   - *Old system*: `stateConfidence` was hardcoded by branch (e.g. search was always 0.85).
   - *New system*: `stateConfidence` is predicted by the LLM based on the actual input. Confidence changes dynamically depending on clarity and certainty. For example, vague inputs will appropriately trigger lower state confidence. 
2. **Retrieval Quality**: How good the retrieved evidence was (calculated heuristically based on tool search results). 
3. **Judge Score**: How good an external LLM judge thought the full run was across relevance, grounding, and appropriateness.
4. **Agreement Score**: How well the predicted action matched the judged best action.

### How Final Trust Score is Computed
The `finalTrustScore` is the final overall trust rating for the run. It fuses these parts dynamically based on the execution path. For instance, a search flow computes its final score via:
`0.25 * stateConfidence + 0.25 * retrievalQuality + 0.40 * judgeScore + 0.10 * agreementScore`

### Trace Capabilities

Every execution generates a comprehensive trace saved automatically in `traces/traces.jsonl`. Traces now store complete context, actions, structural transition errors, and dynamic scores:
- `predictedState`, `stateConfidence`, and `observedState` (with `observedDecisionScore`)
- `judgeEvaluation` covering relevance and grounding
- `scoreBreakdown` giving precise component scores
- `scoreReasons` explaining exactly why each score was assigned

## Example Final Response (w/ Score Breakdown)

```json
{
  "message": "Agent run complete",
  "response": "Machine learning is a subset of artificial intelligence...",
  "trace": {
    "timestamp": "2023-11-20T12:00:00.000Z",
    "input": "Explain machine learning",
    "scoreBreakdown": {
      "stateConfidence": 0.8,
      "retrievalQuality": null,
      "judgeScore": 0.95,
      "agreementScore": 0.9,
      "finalTrustScore": 0.89
    },
    "scoreReasons": {
      "stateReason": "The input contains query words ('what is' or 'explain')...",
      "retrievalQualityReason": "No search results returned.",
      "judgeReason": "Highly grounded and relevant.",
      "agreementReason": "The predicted action correctly matched the judged action."
    }
  }
}
```

## Project Structure

```text
next-state-agent/
├── traces/
│   └── traces.jsonl
├── src/
│   ├── actionSelector.js
│   ├── confidenceCalculator.js
│   ├── evaluator.js
│   ├── executor.js
│   ├── judge.js
│   ├── observer.js
│   ├── predictor.js
│   ├── retrievalScorer.js
│   ├── server.js
│   └── traceStore.js
├── .env.example
├── package.json
└── README.md
```
