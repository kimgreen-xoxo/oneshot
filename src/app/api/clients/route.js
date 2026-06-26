import { supabase } from "@/lib/supabase";

// 고객 저장
export async function POST(request) {
  try {
    const body = await request.json();

    const { error } = await supabase.from("clients").insert({
      client_name: body.clientName || "",
      industry: body.industry?.join(", ") || "",
      goal: body.goal?.join(", ") || "",
      target: body.target || "",
      keyword: body.keyword || "",
      region: body.region || "",
      banned_words: body.bannedWords || "",
      channels: Object.keys(body.channelSettings || {}).join(", "),
      kpi: body.kpi || "",
      schedule: body.schedule || "",
      publish_time: body.publishTime || "",
      start_date: body.startDate || "",
      brand_color: body.brandColor || "",
      tone: body.tone?.join(", ") || "",
      ref_accounts: body.refAccounts || "",
    });

    if (error) throw new Error(error.message);
    return Response.json({ success: true });
  } catch (error) {
    console.error("고객 저장 오류:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

// 고객 목록 조회
// 고객 목록 조회 (clientName으로 단건 필터 가능)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientName = searchParams.get("clientName");

    let query = supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (clientName) {
      query = query.eq("client_name", clientName);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const clients = data.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      clientName: row.client_name,
      industry: row.industry,
      goal: row.goal,
      target: row.target,
      keyword: row.keyword,
      region: row.region,
      bannedWords: row.banned_words,
      channels: row.channels,
      kpi: row.kpi,
      schedule: row.schedule,
      publishTime: row.publish_time,
      startDate: row.start_date,
      brandColor: row.brand_color,
      tone: row.tone,
      refAccounts: row.ref_accounts,
    }));

    return Response.json({ success: true, data: clients });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
