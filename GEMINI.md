# GEMINI.md - DiBot.Ai Project Guide

This document provides context and instructions for the Antigravity agent using the GSD (Get Shit Done) framework.

<!-- GSD:project-start source:PROJECT.md -->
## Project
DiBot.Ai is a transparent AI debate partner for education. It reveals AI reasoning to help users sharpen critical thinking.
<!-- GSD:project-end -->

<!-- GSD:stack-start -->
## Technology Stack
- **Frontend**: React 19, Vite, Axios, React Router DOM.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: MongoDB (Mongoose).
- **AI**: Google Generative AI (Gemini).
- **Styling**: Vanilla CSS with glassmorphism and metallic themes.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start -->
## Conventions
- **Naming**: Use camelCase for JS/JSX and kebab-case for CSS classes.
- **Styling**: Follow the "Mercury" design language (silver, metallic, high-fidelity glass).
- **Components**: Functional components with hooks.
- **Review Before Execute**: Always prepare and present a detailed review/plan of all proposed changes first. DO NOT implement code changes until the user explicitly responds with "ok" or "apply".
<!-- GSD:conventions-end -->

<!-- GSD:workflow-start -->
## GSD Workflow Enforcement
Use the GSD framework for all project changes:
1. **Discuss**: Identify ambiguities.
2. **Plan**: Create task plans in `.planning/`.
3. **Execute**: Perform atomic changes with commits.
4. **Verify**: Check behavior against goals.

Use entry points:
- `/gsd-quick`: Ad-hoc fixes.
- `/gsd-debug`: Bug fixing.
- `/gsd-execute-phase`: Planned work.
<!-- GSD:workflow-end -->

## GSD Skills
Discovered skills in `.agent/skills/`.
Refer to `.agent/skills/gsd-help/SKILL.md` for command details.
