"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function NavBar() {
  const router = useRouter();
  const supabase = supabaseConfigured ? createClient() : null;
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="border-b border-border bg-background px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-foreground text-lg">
        TaxEase
      </Link>
      <div className="flex items-center gap-3">
        {user ? (
          <button
            onClick={() => router.push("/account")}
            className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {user.email?.[0]?.toUpperCase()}
            </span>
            <span className="hidden sm:inline">Account</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
