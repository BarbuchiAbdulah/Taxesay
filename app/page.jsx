import Link from "next/link";
import { CheckCircle, MessageCircle, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center md:py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Tax season doesn't have to be scary.
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            A free guide built for international students — personalized to your visa, country, and income.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="gap-2">
              Get My Tax Guide
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-16 bg-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Answer 5 Questions</h3>
              </div>
              <p className="text-slate-600">
                Tell us about your visa type, country, state, and income sources. Takes less than 2 minutes.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Get Your Personalized Guide</h3>
              </div>
              <p className="text-slate-600">
                Instant results showing required forms, step-by-step instructions, and a document checklist.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">Ask the AI Assistant</h3>
              </div>
              <p className="text-slate-600">
                Have follow-up questions? Chat with an AI assistant powered by Claude for clarification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Who It's For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">F-1 Visa Students</h3>
                <p className="text-slate-600 text-sm">Academic students with OPT/CPT work authorization</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">J-1 Visa Holders</h3>
                <p className="text-slate-600 text-sm">Exchange students and researchers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">H-1B Visa Workers</h3>
                <p className="text-slate-600 text-sm">Professional and specialty occupations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">M-1 Visa Students</h3>
                <p className="text-slate-600 text-sm">Vocational and technical students</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-blue-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to understand your taxes?</h2>
          <p className="text-slate-600 mb-8">Get your personalized tax guide in under 2 minutes.</p>
          <Link href="/onboarding">
            <Button size="lg" className="gap-2">
              Get My Tax Guide
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <footer className="px-4 py-12 bg-slate-900 text-slate-300">
        <div className="max-w-5xl mx-auto text-center text-sm">
          <p>
            <strong>Disclaimer:</strong> This tool is for educational purposes only and does not constitute professional tax advice. 
            Always consult a licensed tax professional or your school's International Student Office for guidance specific to your situation.
          </p>
        </div>
      </footer>
    </div>
  );
}
