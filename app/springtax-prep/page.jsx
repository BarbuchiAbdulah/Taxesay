"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ChevronDown, ChevronUp, Save, Printer, ArrowLeft, CheckCircle } from "lucide-react";

const SECTIONS = [
  {
    id: "personal",
    title: "Personal Information",
    subtitle: "Name, date of birth, SSN/ITIN, and addresses",
    fields: [
      { key: "firstName", label: "First Name", type: "text" },
      { key: "lastName", label: "Last Name", type: "text" },
      { key: "dob", label: "Date of Birth", type: "date" },
      {
        key: "ssn",
        label: "SSN or ITIN",
        type: "text",
        placeholder: "XXX-XX-XXXX (leave blank if you don't have one yet)",
      },
      { key: "usStreet", label: "US Street Address", type: "text" },
      { key: "usCity", label: "US City", type: "text" },
      { key: "usState", label: "US State", type: "text" },
      { key: "usZip", label: "US ZIP Code", type: "text", placeholder: "XXXXX" },
      {
        key: "foreignAddress",
        label: "Home Country Address (full address)",
        type: "textarea",
        placeholder: "Street, City, Country",
      },
    ],
  },
  {
    id: "visa",
    title: "Visa & US Presence",
    subtitle: "Entry dates and time spent in the US during the tax year",
    fields: [
      { key: "visaType", label: "Visa Type", type: "text", prefill: "visa_type" },
      {
        key: "firstEntryDate",
        label: "Date You First Ever Entered the US",
        type: "date",
      },
      {
        key: "taxYearEntryDate",
        label: "Date You Entered the US in the Tax Year",
        type: "date",
      },
      {
        key: "daysInUS",
        label: "Number of Days in the US During the Tax Year",
        type: "number",
        placeholder: "e.g. 180",
      },
      { key: "trip1Departure", label: "Trip 1 — Date Left US (if any)", type: "date" },
      { key: "trip1Return", label: "Trip 1 — Date Returned to US", type: "date" },
      { key: "trip2Departure", label: "Trip 2 — Date Left US (if any)", type: "date" },
      { key: "trip2Return", label: "Trip 2 — Date Returned to US", type: "date" },
      {
        key: "priorYearsInUS",
        label: "Were you in the US in years before the tax year?",
        type: "select",
        options: ["No", "Yes — 1 year", "Yes — 2 years", "Yes — 3 or more years"],
      },
    ],
  },
  {
    id: "w2",
    title: "W-2 Income",
    subtitle: "From employment (OPT, CPT, on-campus job). Skip if you had no W-2.",
    fields: [
      { key: "w2EmployerName", label: "Employer Name", type: "text" },
      {
        key: "w2EIN",
        label: "Employer EIN (Box b on W-2)",
        type: "text",
        placeholder: "XX-XXXXXXX",
      },
      {
        key: "w2Box1",
        label: "Box 1 — Wages, Tips, Other Compensation ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "w2Box2",
        label: "Box 2 — Federal Income Tax Withheld ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "w2Box16",
        label: "Box 16 — State Wages ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "w2Box17",
        label: "Box 17 — State Income Tax Withheld ($)",
        type: "number",
        placeholder: "0.00",
      },
    ],
  },
  {
    id: "1042s",
    title: "Form 1042-S Income",
    subtitle: "Scholarship, fellowship, or treaty payments. Skip if you didn't receive a 1042-S.",
    fields: [
      { key: "payerName", label: "Payer Name", type: "text" },
      { key: "payerEIN", label: "Payer EIN", type: "text" },
      {
        key: "incomeCode",
        label: "Income Code (Box 1 on 1042-S)",
        type: "text",
        placeholder: "e.g. 16 for scholarship",
      },
      {
        key: "grossIncome1042s",
        label: "Gross Income (Box 2) ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "taxWithheld1042s",
        label: "Federal Tax Withheld (Box 7) ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "exemptionCode",
        label: "Exemption Code (Box 4a)",
        type: "text",
        placeholder: "e.g. 04",
      },
    ],
  },
  {
    id: "scholarship",
    title: "Scholarships & Fellowships",
    subtitle: "Any scholarship, fellowship, or stipend — even if not on a 1042-S.",
    fields: [
      {
        key: "scholarshipTotal",
        label: "Total Scholarship / Fellowship Received ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "scholarshipQualified",
        label: "Amount Used for Tuition, Fees, and Required Books ($)",
        type: "number",
        placeholder: "0.00",
      },
      {
        key: "scholarshipNonQualified",
        label: "Amount Used for Room, Board, or Other Living Expenses ($)",
        type: "number",
        placeholder: "0.00",
      },
    ],
  },
  {
    id: "treaty",
    title: "Tax Treaty",
    subtitle: "If your country has a tax treaty with the US, you may qualify for reduced or zero tax.",
    fields: [
      {
        key: "claimingTreaty",
        label: "Are you claiming a tax treaty benefit?",
        type: "select",
        options: ["No", "Yes"],
      },
      {
        key: "treatyCountry",
        label: "Treaty Country",
        type: "text",
        prefill: "country",
      },
      {
        key: "treatyArticle",
        label: "Treaty Article Number",
        type: "text",
        placeholder: "e.g. Article 21(2)",
      },
      {
        key: "treatyAmount",
        label: "Treaty Exempt Amount ($)",
        type: "number",
        placeholder: "0.00",
      },
    ],
  },
  {
    id: "bank",
    title: "Bank Account",
    subtitle: "For direct deposit of your refund (if you are getting one).",
    fields: [
      {
        key: "bankRouting",
        label: "Routing Number (9 digits)",
        type: "text",
        placeholder: "XXXXXXXXX",
      },
      { key: "bankAccount", label: "Account Number", type: "text" },
      {
        key: "bankType",
        label: "Account Type",
        type: "select",
        options: ["Checking", "Savings"],
      },
    ],
  },
];

function sectionProgress(section, answers) {
  const filled = section.fields.filter(
    (f) => answers[f.key] !== undefined && answers[f.key] !== ""
  ).length;
  return { filled, total: section.fields.length };
}

export default function SpringTaxPrepPage() {
  const router = useRouter();
  const supabase = createClient();

  const [answers, setAnswers] = useState({});
  const [open, setOpen] = useState({ personal: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/springtax-prep");
        return;
      }

      const [answersRes, profileRes] = await Promise.all([
        fetch("/api/springtax-prep"),
        fetch("/api/profile"),
      ]);

      let savedAnswers = {};
      if (answersRes.ok) savedAnswers = await answersRes.json();

      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile && Object.keys(savedAnswers).length === 0) {
          savedAnswers = {
            visaType: profile.visa_type || "",
            treatyCountry: profile.country || "",
          };
        }
      }

      setAnswers(savedAnswers);
      setLoading(false);
    }
    load();
  }, []);

  function set(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/springtax-prep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleSection(id) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return null;

  const totalFilled = SECTIONS.reduce(
    (acc, s) => acc + sectionProgress(s, answers).filled,
    0
  );
  const totalFields = SECTIONS.reduce((acc, s) => acc + s.fields.length, 0);

  return (
    <div className="min-h-screen bg-background pb-20 print:pb-0">
      <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/account")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="font-bold text-foreground">SpringTax Prep</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {totalFilled}/{totalFields} fields filled
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 print:mb-4">
          <h1 className="text-xl font-bold text-foreground">SpringTax Prep Sheet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in your answers before opening SpringTax. Everything is saved to your account automatically when you hit Save.
          </p>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((section) => {
            const { filled, total } = sectionProgress(section, answers);
            const isOpen = open[section.id];

            return (
              <div
                key={section.id}
                className="bg-card border border-border rounded-2xl overflow-hidden print:break-inside-avoid"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted transition-colors print:hidden"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground text-sm">{section.title}</p>
                      {filled === total && (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {filled}/{total}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <div className={`${isOpen ? "block" : "hidden"} print:block px-6 pb-6 border-t border-border pt-4 space-y-4`}>
                  <p className="text-xs font-semibold text-foreground print:block hidden">{section.title}</p>
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-foreground mb-1">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          value={answers[field.key] || ""}
                          onChange={(e) => set(field.key, e.target.value)}
                          rows={3}
                          placeholder={field.placeholder || ""}
                          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none print:border-b print:border-0 print:rounded-none print:px-0"
                        />
                      ) : field.type === "select" ? (
                        <select
                          value={answers[field.key] || ""}
                          onChange={(e) => set(field.key, e.target.value)}
                          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select…</option>
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={answers[field.key] || ""}
                          onChange={(e) => set(field.key, e.target.value)}
                          placeholder={field.placeholder || ""}
                          className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring print:border-b print:border-0 print:rounded-none print:px-0"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8 print:hidden">
          Your answers are stored securely and never shared. For educational use only — not tax advice.
        </p>
      </div>
    </div>
  );
}
