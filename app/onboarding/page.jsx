"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronLeft, Search } from "lucide-react";

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Bangladesh", "Belgium", "Brazil", "Canada",
  "China", "Colombia", "Czech Republic", "Denmark", "Egypt", "Finland", "France",
  "Germany", "India", "Indonesia", "Ireland", "Italy", "Japan", "Mexico", "Netherlands",
  "Nigeria", "Pakistan", "Peru", "Philippines", "Poland", "Russia", "South Africa",
  "South Korea", "Spain", "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey",
  "United Kingdom", "Vietnam",
].sort();

const STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
];

const INCOME_OPTIONS = [
  { value: "opt_job", label: "OPT Employment" },
  { value: "cpt_job", label: "CPT Employment" },
  { value: "scholarship", label: "Scholarship / Stipend" },
  { value: "no_income", label: "No US Income" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    country: "",
    visaType: "",
    taxYear: "2024",
    state: "",
    incomeSources: [],
  });

  const [countrySearch, setCountrySearch] = useState("");
  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
  }, [countrySearch]);

  const progress = (step / 5) * 100;

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    if (profile.country && profile.visaType && profile.state && profile.incomeSources.length > 0) {
      localStorage.setItem("taxease_profile", JSON.stringify(profile));
      router.push("/results");
    }
  };

  const updateIncomeSources = (value) => {
    setProfile(prev => {
      const sources = prev.incomeSources.includes(value)
        ? prev.incomeSources.filter(s => s !== value)
        : [...prev.incomeSources, value];
      return { ...prev, incomeSources: sources };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Let's personalize your tax guide
          </h1>
          <p className="text-slate-600">Step {step} of 5</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && "Where are you from?"}
              {step === 2 && "What's your visa type?"}
              {step === 3 && "Which tax year?"}
              {step === 4 && "What state are you in?"}
              {step === 5 && "Tell us about your income"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Country */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredCountries.map(country => (
                    <button
                      key={country}
                      onClick={() => {
                        setProfile(prev => ({ ...prev, country }));
                        setCountrySearch("");
                        handleNext();
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                        profile.country === country
                          ? "bg-blue-50 border-blue-300"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Visa Type */}
            {step === 2 && (
              <div className="space-y-3">
                {["F-1", "J-1", "H-1B", "M-1", "Other"].map(visa => (
                  <button
                    key={visa}
                    onClick={() => {
                      setProfile(prev => ({ ...prev, visaType: visa }));
                      handleNext();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium ${
                      profile.visaType === visa
                        ? "bg-blue-50 border-blue-500 text-blue-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {visa}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Tax Year */}
            {step === 3 && (
              <div className="space-y-3">
                {["2025", "2024", "2023"].map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      setProfile(prev => ({ ...prev, taxYear: year }));
                      handleNext();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium ${
                      profile.taxYear === year
                        ? "bg-blue-50 border-blue-500 text-blue-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: State */}
            {step === 4 && (
              <div className="grid grid-cols-3 gap-2">
                {STATES.map(state => (
                  <button
                    key={state}
                    onClick={() => {
                      setProfile(prev => ({ ...prev, state }));
                      handleNext();
                    }}
                    className={`px-3 py-2 rounded-lg border-2 transition font-medium ${
                      profile.state === state
                        ? "bg-blue-50 border-blue-500 text-blue-900"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            )}

            {/* Step 5: Income Sources */}
            {step === 5 && (
              <div className="space-y-4">
                {INCOME_OPTIONS.map(option => (
                  <div key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    onClick={() => updateIncomeSources(option.value)}
                  >
                    <Checkbox
                      checked={profile.incomeSources.includes(option.value)}
                      onChange={() => {}}
                    />
                    <label className="flex-1 cursor-pointer font-medium text-slate-900">
                      {option.label}
                    </label>
                  </div>
                ))}
                {profile.incomeSources.length === 0 && (
                  <p className="text-sm text-slate-500 italic">Select at least one income source</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex-1" />
          {step < 5 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !profile.country) ||
                (step === 2 && !profile.visaType) ||
                (step === 4 && !profile.state)
              }
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={profile.incomeSources.length === 0}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              Get My Guide
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-slate-200 text-sm">
          <p className="text-slate-600">
            <strong>Summary:</strong> {profile.country || "Country"} • {profile.visaType || "Visa"} • {profile.taxYear} • {profile.state || "State"} • {profile.incomeSources.length > 0 ? profile.incomeSources.join(", ") : "Income"}
          </p>
        </div>
      </div>
    </div>
  );
}
