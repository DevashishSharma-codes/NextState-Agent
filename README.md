# NextState-Agent

A state-predictive AI agent built with **Node.js**, **Express**, **LangChain**, **OpenAI**, and **Tavily Search**.

This project demonstrates a more structured way to build AI agents.

Instead of immediately generating a response, the system first predicts:

* What kind of request this is
* What action should be taken
* How confident it is in that decision

Then it executes the action, evaluates the result, scores the run, and stores a full trace for analysis.

---

# Why This Project Exists

Most basic AI chatbots follow this flow:

```text
User Input → LLM Response
```

That works, but it gives very little visibility into:

* Why the model chose that answer
* Whether it should have used a tool
* How confident it was
* Whether the action was correct
* Whether the result should be trusted

---

# NextState-Agent Adds a Decision Layer

Instead of directly responding, the system does:

```text
User Input
→ Predict Next State
→ Choose Action
→ Execute Action
→ Observe Result
→ Evaluate Transition
→ Score Retrieval
→ Judge Full Run
→ Compute Final Trust Score
→ Save Trace
```

This makes the agent:

* More explainable
* Easier to debug
* Easier to improve
* Better for experimentation
* Better for production workflows

---

# Core Idea: Predict the Next State First

Before taking any action, the agent predicts its next internal state.

Example:

User asks:

```text
Give me latest AI news
```

Predicted state:

```json
{
  "intent": "search",
  "useTools": true,
  "needsClarification": false,
  "plannedActionType": "search_web"
}
```

Meaning:

* This looks like a search request
* A tool should be used
* Clarification is not needed
* Best next action = web search

---

# Features

## Direct Answers

Example:

```text
Explain machine learning
```

The system predicts:

* intent = answer
* useTools = false
* action = respond

Then OpenAI generates a direct answer.

---

## Web Search + Answer Synthesis

Example:

```text
Give me latest AI news
```

The system predicts:

* intent = search
* useTools = true
* action = search_web

Then:

1. Tavily searches the web
2. Search results are retrieved
3. OpenAI turns those results into a final answer

---

## Ask for Clarification

Example:

```text
Explain it again
```

The system predicts:

* intent = clarify
* needsClarification = true
* action = ask_user

Then it asks the user for more context.

---

# Project Structure

```text
src/
├── server.js
├── predictor.js
├── actionSelector.js
├── executor.js
├── observer.js
├── evaluator.js
├── retrievalScorer.js
├── judge.js
├── confidenceCalculator.js
└── traceStore.js

traces/
└── traces.jsonl
```

---

# Module Breakdown

## predictor.js

Predicts the next internal state before any action is taken.

Returns:

* predictedState
* stateConfidence
* stateReason

---

## actionSelector.js

Converts the predicted state into an executable action.

Example:

```json
{
  "type": "search_web"
}
```

---

## executor.js

Performs the chosen action.

Supports:

* Direct answering
* Web search
* Clarification requests

---

## observer.js

Builds the observed state after execution.

Records what actually happened.

---

## evaluator.js

Compares:

* Predicted state
* Observed state

Checks alignment and score differences.

---

## retrievalScorer.js

Evaluates the quality of retrieved search evidence.

Example:

```json
{
  "retrievalQuality": 0.6,
  "retrievalQualityReason": "Found 3 specific article-like results."
}
```

---

## judge.js

Uses an LLM as a second evaluator.

Scores:

* Relevance
* Grounding
* Action Appropriateness
* Overall Run Quality

---

## confidenceCalculator.js

Combines all scores into:

```text
finalTrustScore
```

Uses:

* stateConfidence
* retrievalQuality
* judgeScore
* agreementScore

---

## traceStore.js

Stores every run in `traces.jsonl`.

Useful for:

* Debugging
* Evaluation
* Analytics
* Future improvements

---

# Tech Stack

* Node.js
* Express.js
* JavaScript (ES Modules)
* LangChain
* OpenAI API
* Tavily Search API
* Zod

---

# Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/NextState-Agent.git
cd NextState-Agent
```

---

## Install Dependencies

```bash
npm install
```

Or install required packages manually:

```bash
npm install express dotenv @langchain/openai @langchain/tavily zod
```

---

# Environment Variables

Create a `.env` file in the root folder:

```env
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
PORT=3000
```

---

# Run the Project

```bash
npm start
```

Expected output:

```text
Server is running on port 3000
```

---

# API Endpoints

# GET /

Health check route.

Response:

```text
Next-state agent is running
```

---

# POST /run-agent

Runs the full agent pipeline.

## Request Body

```json
{
  "input": "Give me latest AI news"
}
```

---

## Example Response

```json
{
  "message": "Agent run complete",
  "response": "Here are the latest AI developments...",
  "trace": {
    "input": "Give me latest AI news",
    "predictedState": {
      "intent": "search"
    },
    "stateConfidence": 0.82,
    "action": {
      "type": "search_web"
    },
    "judgeEvaluation": {
      "overallJudgeScore": 0.9
    },
    "scoreBreakdown": {
      "finalTrustScore": 0.81
    }
  }
}
```

---

# Why This Project Is Different

This is not just a chatbot.

It is an agent system with:

## Decision Transparency

You can inspect why it chose an action.

## Confidence Estimation

It scores its own decisions.

## Tool Usage

It can search the web.

## Self Evaluation

It judges its own outputs.

## Trace Logging

Every run is stored for future analysis.

---

# Example Use Cases

* AI agent experimentation
* Explainable AI systems
* Tool-using assistants
* Evaluation pipelines
* Research prototypes
* Debuggable AI workflows

---

# Future Improvements

* Add memory
* Multi-step agents
* More tools
* Better retrieval ranking
* Better confidence calibration
* UI dashboard for traces
* Multi-agent collaboration
* Learned scoring weights

---

# License

MIT License

---

# Author

Built by Devashish Sharma
