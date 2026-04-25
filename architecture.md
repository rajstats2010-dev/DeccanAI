# Architecture & Logic: Catalyst Agent

## 🏗️ System Architecture

The Catalyst Agent operates as a multi-stage pipeline, leveraging the reasoning capabilities of LLMs to bridge the gap between "claimed skills" and "actual proficiency."

## 🧠 Scoring & Logic

### 1. Skill Classification Logic
We use Gemini to categorize skills into three buckets:
- **Matched**: High confidence skills explicitly backed by project descriptions or years of experience.
- **Gaps**: Essential JD requirements missing from the resume.
- **Verify**: Mentioned skills that lack context (e.g., "Python" mentioned in skills but no Python projects listed).

### 2. Conversational Verification
Instead of a simple "yes/no", the agent generates **scenario-based questions**. 
*Example:* If a candidate claims "React Query", the agent might ask: *"How would you handle a race condition where multiple components trigger the same query on mount?"*

### 3. Proficiency Calculation
The Proficiency Score (0-100) is calculated based on:
- **Original Context**: How prominently the skill features in the resume.
- **Interview Response**: The technical depth and correctness of the user's answer during the chat phase.

### 4. Roadmap Generation
The "Adjacent Skills" logic identifies technologies that are naturally related to the candidate's existing stack but required for the target role, ensuring the learning path is **realistic and achievable**.
