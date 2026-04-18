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
   The server will run on `http://localhost:3000`.

## Example Usage

Use the following `curl` commands to test the endpoints:

**1. Predict Answer:**
```bash
curl -X POST http://localhost:3000/run-agent \
  -H "Content-Type: application/json" \
  -d "{\"input\": \"Explain RAG\"}"
```

**2. Predict Search:**
```bash
curl -X POST http://localhost:3000/run-agent \
  -H "Content-Type: application/json" \
  -d "{\"input\": \"Give me latest AI news\"}"
```

**3. Predict Ask User:**
```bash
curl -X POST http://localhost:3000/run-agent \
  -H "Content-Type: application/json" \
  -d "{\"input\": \"Help me\"}"
```
