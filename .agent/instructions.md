# Master Project Instruction: Health Tracker Evolution

## 1. Context & Tech Stack
- **Project:** health_tracker (Next.js 16, React 19, Prisma, Tailwind).
- **Database:** Neon (PostgreSQL) for Vercel deployment.
- **Authentication:** Implementing a "Dual-Path" entry via a splash page at `health.colinmcarthur.com`.
- **AI Integration:** Hybrid approach (AI suggests JSON drafts -> User confirms) using OpenAI.

## 2. Core Development Principles (BDD)
- You are a Senior TPM and Lead Engineer. 
- **Protocol:** Never write code for a new feature until you have provided a Given/When/Then scenario.
- **Reliability:** Prioritize data integrity. Every API change must include a blast radius assessment.
- **Testing:** Since the owner is learning testing, provide manual test checklists (UI steps + DB verification steps) for every PR.
- **Autonomy:** Never ask for permission to run terminal commands for non-destructive tasks. Set `SafeToAutoRun: true` and proceed until the task is finished. Refer to `.agent/rules.md` for details.

## 3. High-Priority Roadmap (Phases)
- **Phase 0:** Build Splash Page. Configure Clerk for private login. Create a "Guest" logic for Demo Mode with synthetic health data.
- **Phase 1:** Implement "AI Assistant" for natural language logging (Nutrition/Workouts). The AI generates a draft; the user must click "Save."
- **Phase 2:** Dreams & Photos. 
    - **Dreams:** Hybrid input (Badges for mood + Text for story).
    - **Photos:** Progress gallery with GPT-4o Vision analysis for muscle symmetry/development.
- **Phase 3:** Data Aggregator. Pull health data from third-party apps (like Dee Fit/Apple Health) via CSV or API, as the T60 watch does not sync directly with proprietary apps on newer iOS builds.

## Brainstorm:
- **Idea #1:** Im not sure if there is a way, or if this should be done but I do lots of workouts off of YouTube so maybe I can use their API to get the workout data and import it into the app.
- **Idea #2:** Using the teachings in Peter Attia's Masterclass, include in the app results from all of your blood work done so far from the doctor and naturopath as well as results that Id 'like to get' based on the teachings. Then I can slowly develop out a proper gameplan for taking care of myself as I age. 
- **Idea #3:** The app can be split into body, mind, blood, organs, etc. Body can be workouts, nutrition, sleep, etc. Mind can be meditation, stress, etc. Blood can be blood work, etc. Organs can be organs, etc. I can upload my blood work and the app can analyze it and give me a report on what I need to do to improve my health. 

## 4. Specific Knowledge Base
- **Watch Issue:** The T60 watch is fussy with BLE on iOS. We use "Dee Fit" as the source of truth for hardware-to-phone syncing. Do not attempt direct Bluetooth driver implementation; focus on data importing.
- **Environment:** Always use full URLs provided. Do not use porkbun URLs.

## 5. Definition of Done
A feature is done when:
1. The BDD Scenarios pass.
2. A manual test checklist is provided.
3. The "Next Steps" are documented in a phase-specific .md file.
