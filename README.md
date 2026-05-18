# TaxEase

A free, educational tax guide for international students in the US. Answer 5 quick questions and get a personalized filing guide with an AI assistant powered by Claude.

> Built for the Claude Code May 2026 Hackathon. Free alternative to Sprintax — educational only, not professional tax advice.

---

## Who It's For

International students on F-1, J-1, H-1B, and M-1 visas who need help understanding their US tax filing requirements.

---

## How It Works

1. Answer 5 questions about your visa, country, state, and income
2. Get a personalized plain-English tax guide
3. Check your required forms and document checklist
4. Ask the AI assistant follow-up questions

---

## Tech Stack

- **Framework:** Next.js 16 + React 19
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **AI:** Claude API (`claude-sonnet-4-6`) — streaming chat
- **State:** localStorage (no database)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local and paste your key

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
├── page.jsx              ← Landing page
├── onboarding/page.jsx   ← 5-step form
├── results/page.jsx      ← Guide + AI chat
└── api/chat/route.js     ← Streaming Claude endpoint

lib/
├── tax-logic.js          ← Rule engine (generateTaxGuide)
├── prompts.js            ← Claude system prompt
├── constants.js          ← Treaty countries, no-tax states
└── utils.js              ← Utility helpers
```

---

## For the Frontend Developer

See [FRONTEND.md](./FRONTEND.md) — everything My teamate Nero will build

---

## Disclaimer

This app is for **educational purposes only** and does not constitute professional tax advice. Always consult a licensed tax professional or your school's International Student Office for guidance specific to your situation.
