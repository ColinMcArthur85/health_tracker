# Development Phases

| Phase | Title | Outcome |
| :--- | :--- | :--- |
| **P0** | **Identity & Demo Mode** | Create the `health.colinmcarthur.com` splash. Implement a "Demo" login that uses a separate, read-only (or daily-reset) database so recruiters can "tinker" without seeing your private weight/dream logs. |
| **P1** | **The Hybrid AI Assistant** | Use your `openai` dependency to build a "Log Draft" feature. You type "12oz Steak," and the AI returns a JSON preview. You click "Confirm" to save it. |
| **P2** | **Progress Photos & Vision AI** | Build the Photo Upload gallery. Integrate a prompt that uses GPT-4o (Vision) to analyze symmetry (e.g., "Left shoulder vs. Right"). Note: This is a high-impact demo for your website. |
| **P3** | **Health Aggregator (The Watch)** | Instead of direct Bluetooth, we'll look at a "CSV/JSON Import" or a "Sync via Apple Health" (since you're on iPhone) to pull data that Dee Fit saves to your phone. |
