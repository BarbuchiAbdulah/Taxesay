import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({});

  const { data } = await supabase
    .from("checklist_items")
    .select("document_name, checked")
    .eq("user_id", user.id);

  const map = {};
  (data ?? []).forEach(({ document_name, checked }) => {
    map[document_name] = checked;
  });
  return NextResponse.json(map);
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { documentName, checked } = await request.json();
  const { error } = await supabase.from("checklist_items").upsert(
    {
      user_id: user.id,
      document_name: documentName,
      checked,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,document_name" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
