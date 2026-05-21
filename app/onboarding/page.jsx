"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase";

const SELECTED_CLS = "border-primary bg-blue-50 text-primary";
const UNSELECTED_CLS = "border-border bg-background text-foreground hover:bg-muted";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina",
  "Brazil","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia",
  "Costa Rica","Croatia","Cuba","Czech Republic","Denmark","Ecuador","Egypt",
  "El Salvador","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece",
  "Guatemala","Honduras","Hong Kong","Hungary","India","Indonesia","Iran","Iraq",
  "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
  "Kuwait","Kyrgyzstan","Lebanon","Libya","Malaysia","Mexico","Moldova","Mongolia",
  "Morocco","Myanmar","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria",
  "North Korea","Norway","Oman","Pakistan","Panama","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Serbia",
  "Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain",
  "Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Tunisia","Turkey","Turkmenistan","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela",
  "Vietnam","Yemen","Zimbabwe",
];

const STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],
  ["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],
  ["DC","District of Columbia"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],
  ["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],["KS","Kansas"],
  ["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],
  ["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],
  ["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],["NY","New York"],
  ["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],["OK","Oklahoma"],
  ["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],
  ["VT","Vermont"],["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],
  ["WI","Wisconsin"],["WY","Wyoming"],
];

const INCOME_OPTIONS = [
  { value: "opt_job", label: "OPT Employment" },
  { value: "cpt_job", label: "CPT Employment" },
  { value: "scholarship", label: "Scholarship / Stipend" },
  { value: "no_income", label: "No US Income" },
];

const TOTAL_STEPS = 5;

function CountryPicker({ value, onChange }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered = useMemo(
    () => query.trim()
      ? COUNTRIES.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
      : COUNTRIES,
    [query]
  );

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        if (!COUNTRIES.includes(query)) setQuery(value);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [query, value]);

  function select(country) {
    setQuery(country);
    onChange(country);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search country…"
        autoComplete="off"
        className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((c) => (
            <li
              key={c}
              onMouseDown={(e) => { e.preventDefault(); select(c); }}
              className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-muted transition-colors ${
                c === value ? "bg-blue-50 text-primary font-medium" : "text-foreground"
              }`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg px-4 py-3 text-sm text-muted-foreground">
          No countries match &quot;{query}&quot;
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    country: "",
    visaType: "",
    taxYear: "",
    state: "",
    incomeSources: [],
  });

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  function set(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function toggleIncome(value) {
    setProfile((prev) => {
      const current = prev.incomeSources;
      if (value === "no_income") {
        return { ...prev, incomeSources: current.includes("no_income") ? [] : ["no_income"] };
      }
      const without = current.filter((v) => v !== "no_income");
      return {
        ...prev,
        incomeSources: without.includes(value)
          ? without.filter((v) => v !== value)
          : [...without, value],
      };
    });
  }

  function canAdvance() {
    if (step === 1) return profile.country.trim() !== "";
    if (step === 2) return profile.visaType !== "";
    if (step === 3) return profile.taxYear !== "";
    if (step === 4) return profile.state !== "";
    if (step === 5) return profile.incomeSources.length > 0;
    return false;
  }

  async function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem("taxease_profile", JSON.stringify(profile));
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
          });
        }
      }
      router.push("/results");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">TaxEase</h1>
          <p className="text-sm text-muted-foreground mt-1">Step {step} of {TOTAL_STEPS}</p>
        </div>

        <div className="w-full h-2 bg-muted rounded-full mb-10 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Where are you from?</h2>
              <p className="text-sm text-muted-foreground mb-6">Select your country of origin</p>
              <CountryPicker
                value={profile.country}
                onChange={(v) => set("country", v)}
              />
              {profile.country && (
                <p className="mt-2 text-sm text-primary font-medium">✓ {profile.country}</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">What is your visa type?</h2>
              <p className="text-sm text-muted-foreground mb-6">Select your current US visa</p>
              <div className="grid grid-cols-1 gap-3">
                {["F-1", "J-1", "H-1B", "M-1", "Other"].map((v) => (
                  <button
                    key={v}
                    onClick={() => set("visaType", v)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${profile.visaType === v ? SELECTED_CLS : UNSELECTED_CLS}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Which tax year?</h2>
              <p className="text-sm text-muted-foreground mb-6">Select the year you are filing for</p>
              <div className="grid grid-cols-3 gap-3">
                {["2025", "2024", "2023"].map((y) => (
                  <button
                    key={y}
                    onClick={() => set("taxYear", y)}
                    className={`py-3 rounded-lg border text-sm font-semibold transition-colors ${profile.taxYear === y ? SELECTED_CLS : UNSELECTED_CLS}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Which US state do you live in?</h2>
              <p className="text-sm text-muted-foreground mb-6">Used to determine state filing requirements</p>
              <select
                value={profile.state}
                onChange={(e) => set("state", e.target.value)}
                className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a state…</option>
                {STATES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">What are your income sources?</h2>
              <p className="text-sm text-muted-foreground mb-6">Select all that apply for this tax year</p>
              <div className="grid grid-cols-1 gap-3">
                {INCOME_OPTIONS.map((opt) => {
                  const checked = profile.incomeSources.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggleIncome(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left ${checked ? SELECTED_CLS : UNSELECTED_CLS}`}
                    >
                      <span
                        className={`w-5 h-5 rounded shrink-0 flex items-center justify-center border-2 transition-colors ${
                          checked ? "bg-primary border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {checked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex items-center gap-1 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {step === TOTAL_STEPS ? "See My Guide" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
