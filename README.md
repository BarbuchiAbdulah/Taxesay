# TaxEase

A free, educational tax guide for international students in the US. Answer 5 quick questions and get a personalized filing guide, an AI assistant, a SpringTax prep sheet, and a secure account to store your documents.

> Built for the Claude Code May 2026 Hackathon. Free alternative to Sprintax — educational only, not professional tax advice.

---

## Who It's For

International students on F-1, J-1, H-1B, and M-1 visas who need help understanding their US tax filing requirements.

---

## Features

- **Personalized tax guide** — answer 5 questions, get a plain-English breakdown of your filing situation
- **Required forms list** — know exactly which IRS forms you need with direct links
- **Step-by-step filing guide** — numbered steps tailored to your visa and income
- **Document checklist** — track which documents you've gathered (syncs to your account)
- **AI chat assistant** — ask follow-up questions powered by Claude
- **Free accounts** — save your profile and checklist across devices (powered by Supabase)
- **Document storage** — securely upload your W-2, 1042-S, I-20, and other tax documents
- **SpringTax prep sheet** — fill in every answer SpringTax will ask before you start filing, so you can move through it without stopping to look things up

---

## How It Works

1. Answer 5 quick questions — country, visa type, tax year, state, income sources
2. Get your personalized tax guide with forms, steps, and a document checklist
3. Chat with the AI assistant for follow-up questions
4. Create a free account to save everything and upload your documents
5. Fill out the SpringTax prep sheet so filing day is easy

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 + React 19 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| AI | Claude API (`claude-sonnet-4-6`) — streaming chat |
| Auth + Database | Supabase (email/password auth, PostgreSQL, Storage) |
| State | localStorage (guest) + Supabase (logged-in) |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/BarbuchiAbdulah/Taxesay.git
cd Taxesay
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your keys:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Getting your keys:**
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)
- Supabase keys → [supabase.com](https://supabase.com) → your project → Settings → API

> The app works without Supabase keys — onboarding, the tax guide, and AI chat all work via localStorage. Accounts, document uploads, and SpringTax prep require Supabase.

### 3. Set up Supabase (for accounts + document uploads)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run everything in [`supabase-schema.sql`](./supabase-schema.sql)
3. Go to **Storage** → create a bucket named `tax-documents` → set it to **private**
4. In Storage → Policies, add a policy so users can only access their own folder

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
├── page.jsx                    ← Landing page
├── layout.jsx                  ← Root layout with global NavBar
├── login/page.jsx              ← Login / Sign Up
├── account/page.jsx            ← Account dashboard + document uploads
├── onboarding/page.jsx         ← 5-step profile form
├── results/page.jsx            ← Tax guide + AI chat + document uploads
├── springtax-prep/page.jsx     ← SpringTax prep sheet (7 sections)
└── api/
    ├── chat/route.js           ← Streaming Claude chat endpoint
    ├── profile/route.js        ← Save/load tax profile
    ├── documents/route.js      ← Upload/list/delete documents
    ├── checklist/route.js      ← Sync checklist state
    └── springtax-prep/route.js ← Save/load SpringTax answers

lib/
├── tax-logic.js                ← Rule engine (generateTaxGuide)
├── prompts.js                  ← Claude system prompt builder
├── constants.js                ← Treaty countries, no-tax states, IRS URLs
├── supabase.js                 ← Browser Supabase client
├── supabase-server.js          ← Server-side Supabase client
└── utils.js                    ← Utility helpers

components/
└── NavBar.jsx                  ← Global nav bar (Login / Account)
```

---

## SpringTax Prep Sheet

The prep sheet covers all 7 sections SpringTax asks about:

1. **Personal Information** — name, DOB, SSN/ITIN, US and home country addresses
2. **Visa & US Presence** — visa type, entry dates, days in US, travel history
3. **W-2 Income** — employer name, EIN, wages, federal and state withholding
4. **Form 1042-S** — payer info, income code, gross income, tax withheld
5. **Scholarships & Fellowships** — total received, qualified vs. non-qualified amounts
6. **Tax Treaty** — claiming a treaty, article number, exempt amount
7. **Bank Account** — routing number, account number, account type for direct deposit

Answers save to your account and can be printed for reference.

---

## For the Frontend Developer

See [FRONTEND.md](./FRONTEND.md) for frontend-specific notes.

---

## Disclaimer

This app is for **educational purposes only** and does not constitute professional tax advice. Always consult a licensed tax professional or your school's International Student Office for guidance specific to your situation.
