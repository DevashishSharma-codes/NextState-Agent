# next-state-agent

A minimal Node.js + Express backend project that simulates a next-state predictive agent workflow.

## Overview

The agent performs a sequence of operations to handle an input:

1. Predicts the next internal state based on user input.
2. Selects an action based on the predicted state.
3. Executes the action to produce a result.
4. Infers an observed state from the executed action's result.
5. Computes a transition error comparing predicted state with observed state.
6. Saves a structured trace log.

All traces are stored locally as JSON lines in `traces/traces.jsonl`.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

The server runs on `http://localhost:3000`.

## API Endpoint

### POST `/run-agent`

Send JSON:

```json
{ "input": "Explain RAG" }
```

## Testing with Postman

1. Open Postman.
2. Create a new **POST** request.
3. URL: `http://localhost:3000/run-agent`
4. Go to **Headers**:

   * `Content-Type: application/json`
5. Go to **Body > raw > JSON**.
6. Paste one of the examples below and click **Send**.

### Example 1: Predict Answer

```json
{ "input": "Explain RAG" }
```

### Example 2: Predict Search

```json
{ "input": "Give me latest AI news" }
```

### Example 3: Predict Ask User

```json
{ "input": "Help me" }
```

## Example Response

```json
{
  "predictedState": "answer",
  "action": "generate_response",
  "result": "Here is your answer...",
  "observedState": "answer",
  "transitionError": false
}
```

## Project Structure

```text
next-state-agent/
├── traces/
│   └── traces.jsonl
├── package.json
├── server.js
└── README.md
```

## Future Improvements

* Add frontend UI
* Connect real LLM APIs
* Add database storage
* Improve prediction engine
* Add authentication
