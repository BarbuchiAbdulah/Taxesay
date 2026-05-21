"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  ClipboardList,
  LogOut,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      const [profileRes, docsRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/documents"),
      ]);
      if (profileRes.ok) {
        const p = await profileRes.json();
        if (p) setProfile(p);
      }
      if (docsRes.ok) setDocuments(await docsRes.json());
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10 MB.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/documents", { method: "POST", body: formData });
    if (res.ok) {
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(id, storagePath) {
    if (!confirm("Delete this document?")) return;
    await fetch(
      `/api/documents?id=${id}&path=${encodeURIComponent(storagePath)}`,
      { method: "DELETE" }
    );
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleDownload(storagePath, name) {
    const res = await fetch(
      `/api/documents?download=1&path=${encodeURIComponent(storagePath)}`
    );
    if (!res.ok) return;
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return null;

  const INCOME_LABELS = {
    opt_job: "OPT Employment",
    cpt_job: "CPT Employment",
    scholarship: "Scholarship / Stipend",
    no_income: "No US Income",
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Your TaxEase account</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        {/* Tax Profile */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Tax Profile</h2>
            <button
              onClick={() => router.push("/onboarding")}
              className="text-xs text-primary hover:underline"
            >
              {profile ? "Edit" : "Complete profile"}
            </button>
          </div>
          {profile ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Visa", profile.visa_type],
                ["Country", profile.country],
                ["State", profile.state],
                ["Tax Year", profile.tax_year],
                ["Income", profile.income_sources?.map((s) => INCOME_LABELS[s] || s).join(", ")],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{value || "—"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">No profile saved yet.</p>
              <button
                onClick={() => router.push("/onboarding")}
                className="text-sm text-primary font-medium hover:underline"
              >
                Complete your tax profile →
              </button>
            </div>
          )}
        </section>

        {/* SpringTax Prep */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <ClipboardList className="h-8 w-8 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">SpringTax Preparation</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in all the answers SpringTax will ask before you start filing — so you can move through it without stopping to look things up.
              </p>
              <button
                onClick={() => router.push("/springtax-prep")}
                className="mt-3 inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Open SpringTax Prep →
              </button>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Your Documents</h2>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          {documents.length === 0 ? (
            <div
              className="text-center py-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload your W-2, 1042-S, I-20, and more (PDF, PNG, JPG · max 10 MB)
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl"
                >
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.size_bytes / 1024).toFixed(0)} KB ·{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(doc.storage_path, doc.name)}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id, doc.storage_path)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <button
            onClick={() => router.push("/results")}
            className="text-sm text-primary hover:underline"
          >
            ← Back to my tax guide
          </button>
        </div>
      </div>
    </div>
  );
}
