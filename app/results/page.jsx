"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateTaxGuide } from "@/lib/tax-logic.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, FileText, MessageCircle, ExternalLink, Send, X, Loader } from "lucide-react";

export default function ResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [guide, setGuide] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [partial, setPartial] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatInput, setChatInput] = useState("");

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

  if (!guide) return null;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
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
              setPartial(full);
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: full }]);
      setStreaming(false);
    } catch (error) {
      console.error("Chat error:", error);
      setStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Your Tax Guide</h1>
          <p className="text-slate-600">Personalized results for your tax situation</p>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-1">Visa Type</p>
                <p className="font-semibold text-slate-900">{profile.visaType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Country</p>
                <p className="font-semibold text-slate-900">{profile.country}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">State</p>
                <p className="font-semibold text-slate-900">{profile.state}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Tax Year</p>
                <p className="font-semibold text-slate-900">{profile.taxYear}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Residency Status</p>
                <p className="font-semibold text-slate-900">{guide.residencyStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Tax Situation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Your Tax Situation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 leading-relaxed">{guide.summary}</p>
            {guide.hasTreatyNote && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900 mb-1">✓ Treaty Country</p>
                <p className="text-sm text-green-800">
                  {profile.country} has a US tax treaty that may affect your filing requirements.
                </p>
              </div>
            )}
            {guide.stateNote && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">{guide.stateNote}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Forms You Need */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Forms You Need
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guide.forms.map(form => (
                <div key={form.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-1">
                      {form.name}
                      {form.required && <Badge className="bg-red-600">Required</Badge>}
                    </h3>
                    <p className="text-sm text-slate-600">{form.description}</p>
                  </div>
                  <a
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 flex-shrink-0"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      View <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step-by-Step Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-6">
              {guide.steps.map(step => (
                <li key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-slate-600 text-sm">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Document Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Document Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guide.documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setCheckedDocs(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                >
                  <Checkbox
                    checked={checkedDocs[doc.id] || false}
                    onChange={() => {}}
                  />
                  <div className="flex-1">
                    <label className="cursor-pointer font-medium text-slate-900">
                      {doc.label}
                      {doc.required && <Badge className="ml-2 bg-red-600">Required</Badge>}
                    </label>
                    <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="p-6 bg-slate-100 rounded-lg mb-8 border border-slate-300">
          <p className="text-sm text-slate-700">
            <strong>Disclaimer:</strong> This tool is for educational purposes only and does not constitute professional tax advice. 
            Always consult a licensed tax professional or your school's International Student Office for guidance specific to your situation.
          </p>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 h-screen md:h-96 bg-white rounded-t-lg md:rounded-lg shadow-xl border border-slate-300 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-blue-600 text-white rounded-t-lg md:rounded-t-lg">
            <h3 className="font-semibold">Tax Guide Assistant</h3>
            <button onClick={() => setChatOpen(false)} className="hover:bg-blue-700 p-1 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 text-sm py-8">
                <p className="mb-2">👋 Hi! I'm here to help.</p>
                <p>Ask me any questions about your taxes.</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg max-w-xs">
                  <p className="text-sm">{partial || <Loader className="w-4 h-4 animate-spin" />}</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={streaming}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                disabled={streaming || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg p-2 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
