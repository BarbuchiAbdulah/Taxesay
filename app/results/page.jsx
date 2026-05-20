"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { generateTaxGuide } from "@/lib/tax-logic.js";
import {
  CheckCircle,
  FileText,
  MessageCircle,
  X,
  Send,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [guide, setGuide] = useState(null);
  const [checked, setChecked] = useState({});

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partial, setPartial] = useState("");
  const [streaming, setStreaming] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("taxease_profile");
    if (!stored) {
      router.push("/onboarding");
      return;
    }
    const p = JSON.parse(stored);
    setProfile(p);
    setGuide(generateTaxGuide(p));
  }, [router]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, partial]);

  if (!guide || !profile) return null;

  async function sendMessage(text) {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setPartial("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, profile }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        let chunkUpdated = false;
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) { full += parsed.text; chunkUpdated = true; }
            if (parsed.error) { full = "Sorry, something went wrong. Please try again."; chunkUpdated = true; }
          } catch {}
        }
        if (chunkUpdated) setPartial(full);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again." },
      ]);
    } finally {
      setStreaming(false);
      setPartial("");
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    sendMessage(input.trim());
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-foreground text-lg">TaxEase</span>
        <button
          onClick={() => router.push("/onboarding")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Start over
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-semibold text-foreground text-lg mb-4">Your Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Visa", value: profile.visaType },
              { label: "Country", value: profile.country },
              { label: "State", value: profile.state },
              { label: "Tax Year", value: profile.taxYear },
              { label: "Residency", value: guide.residencyStatus },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="font-medium text-foreground text-sm mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-foreground text-lg">Your Tax Situation</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{guide.summary}</p>

          {guide.hasTreatyNote && (
            <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>{profile.country}</strong> has a tax treaty with the United States. This may
                reduce or eliminate taxes on certain types of income. See IRS Publication 901 for
                details.
              </p>
            </div>
          )}

          <div className="bg-muted rounded-xl px-4 py-3">
            <p className="text-sm text-muted-foreground">{guide.stateNote}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-foreground text-lg">Forms You Need</h2>
          {guide.forms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No federal income tax forms required.</p>
          ) : (
            guide.forms.map((form) => (
              <a
                key={form.id}
                href={form.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors group"
              >
                <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground text-sm">{form.name}</span>
                    {form.required && (
                      <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-medium">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{form.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
              </a>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-foreground text-lg">Step-by-Step Guide</h2>
          <div className="space-y-3">
            {guide.steps.map((s) => (
              <div key={s.step} className="flex gap-4 bg-card border border-border rounded-xl p-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {s.step}
                </span>
                <div>
                  <p className="font-medium text-foreground text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-semibold text-foreground text-lg">Document Checklist</h2>
          <div className="space-y-2">
            {guide.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setChecked((prev) => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                  checked[doc.id]
                    ? "border-green-400 bg-green-50"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <CheckCircle
                  className={`h-5 w-5 flex-shrink-0 mt-0.5 transition-colors ${
                    checked[doc.id] ? "text-green-600" : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${checked[doc.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {doc.label}
                    </span>
                    {doc.required && (
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center leading-relaxed border-t border-border pt-6">
          This tool is for educational purposes only and does not constitute professional tax
          advice. Please consult a licensed tax professional or your school&apos;s International
          Student Office for guidance specific to your situation.
        </p>
      </div>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg font-semibold text-sm hover:opacity-90 transition-opacity z-20"
      >
        <MessageCircle className="h-5 w-5" />
        Ask TaxEase AI
      </button>

      {chatOpen && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center sm:justify-end sm:p-6">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setChatOpen(false)}
          />

          <div className="relative w-full sm:w-[420px] h-[85vh] sm:h-[600px] bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground text-sm">TaxEase AI</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground mt-8">
                  <p className="font-medium text-foreground mb-2">Hi! I&apos;m TaxEase AI.</p>
                  <p>Ask me anything about your tax situation.</p>
                  <div className="mt-4 space-y-2">
                    {[
                      "Do I need to file if I made very little?",
                      "What is Form 8843?",
                      "When is the filing deadline?",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="w-full text-left px-3 py-2 rounded-lg border border-border text-xs hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {streaming && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted text-foreground">
                    {partial ? (
                      <div className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                        {partial}
                        <span className="inline-block w-1.5 h-4 bg-muted-foreground/50 ml-0.5 animate-pulse rounded-sm" />
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="px-4 py-3 border-t border-border flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                disabled={streaming}
                className="flex-1 border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="flex-shrink-0 bg-primary text-primary-foreground rounded-lg px-3 py-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
