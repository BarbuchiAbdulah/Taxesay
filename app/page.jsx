import Link from "next/link";
import { CheckCircle, FileText, MessageCircle, ChevronRight } from "lucide-react";

function CtaLink({ className = "" }) {
  return (
    <Link
      href="/onboarding"
      className={`inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity ${className}`}
    >
      Get My Tax Guide
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <main className="flex-1">
        <section className="bg-linear-to-b from-blue-50 to-background px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Tax season doesn&apos;t have to be scary.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A free guide built for international students — personalized to your
            visa, country, and income.
          </p>
          <CtaLink className="mt-8 text-base" />
        </section>

        {/* How it works */}
        <section className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-foreground mb-10">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-7 w-7 text-primary" />,
                step: "1",
                title: "Answer 5 questions",
                desc: "Tell us your visa type, country, income, and state.",
              },
              {
                icon: <CheckCircle className="h-7 w-7 text-primary" />,
                step: "2",
                title: "Get your guide",
                desc: "We generate your personalized filing checklist and required forms.",
              },
              {
                icon: <MessageCircle className="h-7 w-7 text-primary" />,
                step: "3",
                title: "Ask the AI",
                desc: "Chat with TaxEase to get answers about your specific situation.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Step {item.step}
                </span>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="bg-muted px-6 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Built for international students
            </h2>
            <p className="text-muted-foreground mb-8">
              Whether you&apos;re on F-1, J-1, OPT, CPT, or H-1B — we have
              guidance tailored to your situation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["F-1 Students", "J-1 Exchange Visitors", "OPT / CPT Workers", "H-1B Holders"].map(
                (label) => (
                  <span
                    key={label}
                    className="px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-foreground"
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Ready to get started?
          </h2>
          <CtaLink />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        TaxEase is for educational purposes only and does not constitute
        professional tax advice. Please consult a licensed tax professional or
        your school&apos;s International Student Office for guidance specific to
        your situation.
      </footer>
    </div>
  );
}
