# TaxEase — Frontend Guide

> Nero Part ( good luck with that )  — I made the backend (API, logic, types) is already built. You own 3 pages. I tryied to put everything you need here.

---

## Quick Start

```bash
# 1. Clone & install
git clone <repo-url>
cd taxease
npm install

# 2. Add your API key
cp .env.example .env.local
# Open .env.local and paste your Anthropic key

# 3. Run
npm run dev
# → http://localhost:3000
```

---

## User Flow

```
/ (Landing)  →  /onboarding (5-step form)  →  /results (guide + AI chat)
```

---

## Files You Own

```
app/
├── page.jsx              ← Landing page          (YOU BUILD)
├── onboarding/
│   └── page.jsx          ← 5-question form       (YOU BUILD)
└── results/
    └── page.jsx          ← Results + AI chat     (YOU BUILD)
```

Everything else is done — do not edit files in `lib/`, `app/api/`, or `app/layout.jsx`.

---

## Data Contracts

### StudentProfile — what you collect in the form

```js
{
  country: "South Korea",           // string — full country name
  visaType: "F-1",                  // "F-1" | "J-1" | "H-1B" | "M-1" | "Other"
  taxYear: "2024",                  // "2023" | "2024" | "2025"
  state: "OR",                      // 2-letter state code e.g. "CA", "NY", "TX"
  incomeSources: ["opt_job"]        // array of: "opt_job" | "cpt_job" | "scholarship" | "no_income"
}
```

> **Important:** `state` must be the 2-letter abbreviation, not the full name.

### TaxGuide — what the rule engine gives back

```js
import { generateTaxGuide } from "@/lib/tax-logic.js";

const guide = generateTaxGuide(profile);

guide.residencyStatus   // "Non-Resident Alien" | "Resident Alien"
guide.summary           // plain-English explanation string
guide.hasTreatyNote     // boolean — true if country has a US tax treaty
guide.stateNote         // state-specific filing note string

guide.forms[]           // array of { id, name, description, url, required }
guide.steps[]           // array of { step, title, description }
guide.documents[]       // array of { id, label, description, required }
```

---

## Page 1 — Landing (`app/page.jsx`)

Route: `http://localhost:3000/`

This is a **Server Component** (no `"use client"` needed).

### Sections to build

| Section | Content |
|---|---|
| Hero | Headline + subheadline + CTA button → `/onboarding` |
| How it works | 3 steps: Answer questions → Get your guide → Ask the AI |
| Who it's for | F-1, J-1, OPT/CPT, H-1B |
| Footer | Disclaimer (educational only, not professional tax advice) |

### Suggested copy

```
Headline:    "Tax season doesn't have to be scary."
Subheadline: "A free guide built for international students —
              personalized to your visa, country, and income."
CTA button:  "Get My Tax Guide"  → links to /onboarding
```

---

## Page 2 — Onboarding (`app/onboarding/page.jsx`)

Route: `http://localhost:3000/onboarding`

Add `"use client"` at the top — this page uses `useState` and `useRouter`.

### Multi-step form — one question per screen

Use a `step` state variable (1–5) and a progress bar.

| Step | Question | Field | Input type |
|---|---|---|---|
| 1 | Country of origin | `profile.country` | Searchable dropdown / text |
| 2 | Visa type | `profile.visaType` | Select: F-1 / J-1 / H-1B / M-1 / Other |
| 3 | Tax year | `profile.taxYear` | Select: 2025 / 2024 / 2023 |
| 4 | US State | `profile.state` | Dropdown — all 50 states + DC (2-letter codes) |
| 5 | Income sources | `profile.incomeSources` | Multi-select checkboxes |

**Income source options:**

| Value | Label shown to user |
|---|---|
| `"opt_job"` | OPT Employment |
| `"cpt_job"` | CPT Employment |
| `"scholarship"` | Scholarship / Stipend |
| `"no_income"` | No US Income |

### On final step — save and navigate

```js
"use client";
import { useRouter } from "next/navigation";

const router = useRouter();

function handleFinish() {
  localStorage.setItem("taxease_profile", JSON.stringify(profile));
  router.push("/results");
}
```

---

## Page 3 — Results (`app/results/page.jsx`)

Route: `http://localhost:3000/results`

Add `"use client"` at the top — reads from localStorage.

### Loading the data

```js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateTaxGuide } from "@/lib/tax-logic.js";

export default function ResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("taxease_profile");
    if (!stored) { router.push("/onboarding"); return; }
    const p = JSON.parse(stored);
    setProfile(p);
    setGuide(generateTaxGuide(p));
  }, []);

  if (!guide) return null; // or a loading spinner
  // ... render sections below
}
```

### Sections to build

**1. Profile summary card**
Show: visa type, country, state, tax year, residency status (`guide.residencyStatus`)

**2. "Your Tax Situation"**
Show: `guide.summary`
If `guide.hasTreatyNote === true`, show a highlighted treaty notice box.

**3. "Forms You Need"**
Loop `guide.forms`:
```js
guide.forms.map(form => (
  <a href={form.url} target="_blank">{form.name}</a>
  // show form.description and mark required ones
))
```

**4. "Step-by-Step Guide"**
Loop `guide.steps` — numbered list:
```js
guide.steps.map(s => <div>{s.step}. {s.title}: {s.description}</div>)
```

**5. "Document Checklist"**
Loop `guide.documents` — each item checkable with `useState`:
```js
const [checked, setChecked] = useState({});
// toggle: setChecked(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))
```
Mark required ones with a badge.

**6. AI Chat button (floating)**
On click, open a chat panel. See AI Chat section below.

**7. Disclaimer (required)**
Always show at the bottom:
> "This tool is for educational purposes only and does not constitute professional tax advice. Please consult a licensed tax professional or your school's International Student Office for guidance specific to your situation."

---

## AI Chat — How to wire it up

The API at `POST /api/chat` streams text back as Server-Sent Events.

### Sending a message

```js
async function sendMessage(userText) {
  const newMessages = [...messages, { role: "user", content: userText }];
  setMessages(newMessages);
  setStreaming(true);
  setPartial("");

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: newMessages, profile }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;
      try {
        const parsed = JSON.parse(data);
        if (parsed.text) {
          full += parsed.text;
          setPartial(full); // show partial response as it streams
        }
      } catch {}
    }
  }

  setMessages(prev => [...prev, { role: "assistant", content: full }]);
  setStreaming(false);
}
```

### Chat state to manage

```js
const [messages, setMessages] = useState([]);   // full history
const [partial, setPartial] = useState("");     // text streaming in right now
const [streaming, setStreaming] = useState(false);
const [chatOpen, setChatOpen] = useState(false);
```

---

## UI Components Available

shadcn/ui is installed. Import from `@/components/ui/`:

```js
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
```

If a component isn't scaffolded yet, add it with:
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add progress
npx shadcn@latest add checkbox
```

Icons from `lucide-react`:
```js
import { CheckCircle, FileText, MessageCircle, ChevronRight } from "lucide-react";
```

---

## Design Guidelines

| | |
|---|---|
| Primary color | Blue `#2563eb` — already set as `--primary` CSS variable |
| Backgrounds | Slate / gray — use `bg-muted`, `bg-card` |
| Vibe | Calm, clean, trustworthy — reduce anxiety |
| Font | System font (already set in globals.css) |

Use Tailwind classes. CSS variables are already wired up in `app/globals.css`.

---

## Demo Script (for hackathon judges)

**Profile 1:**
```
Country: South Korea | Visa: F-1 | Year: 2024 | State: OR | Income: OPT Employment
```
Expected results:
- Residency: Non-Resident Alien
- Forms: 8843 + 1040-NR
- Documents: Passport, Visa, I-20, W-2
- No treaty note (South Korea not listed — update constants.js if needed)

**Profile 2:**
```
Country: India | Visa: J-1 | Year: 2024 | State: CA | Income: No US Income
```
Expected results:
- Residency: Non-Resident Alien
- Forms: 8843 only
- Treaty note shown (India has a US tax treaty)
- State note mentions California has state income tax

**Suggested chat question:** "Do I need to file even if I made very little money?"

---

## Path Aliases

`@/` resolves to the project root:

```js
import { generateTaxGuide } from "@/lib/tax-logic.js";
import { cn } from "@/lib/utils.js";
import { Button } from "@/components/ui/button";
```

---
