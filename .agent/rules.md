# Agent Autonomy Rules

- **Terminal Commands:** Always set `SafeToAutoRun: true` for any terminal command that is not destructive (e.g., `git`, `npm`, `npx prisma`, `ls`, etc.). 
- **Continuous Execution:** Proceed with tasks autonomously until they are complete. If a step requires a terminal command, execute it and then move to the next logical step without waiting for manual confirmation, unless an error occurs that requires user intervention.
- **Workflow Turbo:** All workflows in this repository should be treated as having the `// turbo-all` directive.
- **UI/UX:** For web application development, prioritize high-fidelity, premium aesthetics and rich interactions without stopping for incremental approval of minor UI choices.
