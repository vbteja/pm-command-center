# PM Command Center

A production-grade project management platform built to demonstrate
full-stack PM skills across 8 interactive modules.

## Live demo
👉 https://your-pm-vercel-url.vercel.app

---

## What this is

Most PM portfolios are slide decks and Notion pages. This is a fully
deployed, interactive project management platform powered by a real
database and AI-driven insights.

---

## 8 interactive modules

- **Overview** — Sprint completion, risk count, budget, OKR progress, AI insights
- **OKRs** — 4 objectives with 11 key results and progress tracking
- **Roadmap** — Q1 to Q4 initiative planning across 4 teams
- **Kanban** — Drag and drop cards with real database persistence
- **Risks** — Probability x impact matrix with mitigation plans
- **Compliance** — HIPAA, GDPR and CCPA control tracking
- **Stakeholders** — Influence and engagement mapping
- **Financials** — $2.4M budget tracked across 6 workstreams

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 + Tailwind CSS |
| Database | Supabase (Postgres) |
| AI | Anthropic Claude Sonnet |
| Deployment | Vercel |

---

## Running locally

1. Clone the repo and install dependencies

        git clone https://github.com/vbteja/pm-command-center.git
        cd pm-command-center
        npm install

2. Create .env.local with these variables

        NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        ANTHROPIC_API_KEY=your_claude_api_key

3. Run the dev server

        npm run dev

---

## PM skills showcased

- Roadmap planning across 4 teams and 4 quarters
- Sprint management with real Kanban persistence
- Risk management with probability x impact scoring
- OKR methodology with key result tracking
- Compliance governance — HIPAA, GDPR, CCPA
- Stakeholder engagement and influence mapping
- Budget tracking with threshold alerts
- AI literacy — Claude API for augmented insights

---

## About

Built by Brahma Teja — Product and Project Manager with 4+ years of experience.

- LinkedIn: https://linkedin.com/in/brahma-teja-69b91a185
- GitHub: https://github.com/vbteja
- Email: brahma.tej19@gmail.com
