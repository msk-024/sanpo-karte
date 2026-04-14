import { NextRequest, NextResponse } from "next/server";

export type DocType =
  | "mail-notice"
  | "formal-notice"
  | "form-with-reply"
  | "business-formal";

type Context = {
  topic?: string;
  content?: string;
  notes?: string;
  name?: string | null;
  department?: string | null;
  nurseName?: string | null;
  officeName?: string | null;
};

function buildPrompt(type: DocType, ctx: Context): string {
  const topic    = ctx.topic      || "産業保健";
  const content  = ctx.content    ? `\n【内容・要点】${ctx.content}` : "";
  const notes    = ctx.notes      ? `\n【備考（期限・提出先・オプション等）】${ctx.notes}` : "";
  const nurse    = ctx.nurseName  ? `\n担当保健師：${ctx.nurseName}` : "";
  const office   = ctx.officeName ? `\n事業所名：${ctx.officeName}` : "";
  const dept     = ctx.department ? `\n対象部署：${ctx.department}` : "";

  switch (type) {
    case "mail-notice":
      return `あなたは産業保健師です。${topic}に関するお知らせ文を作成してください。
${ctx.name
  ? `宛先は「${ctx.name}」さん個人に向けた文体で（冒頭に「${ctx.name} さん」と書く）、`
  : "「従業員各位」宛てで、"}やわらかく親しみやすい文体で300字以内にまとめてください。
箇条書きは避け、自然な文章で書いてください。${dept}${nurse}${office}${content}${notes}`;

    case "formal-notice":
      return `あなたは産業保健師です。${topic}に関するA4正式案内文を作成してください。
必ず以下の構成でそのまま使えるA4文書として出力してください：

令和○年○月○日

従業員各位${dept ? `\n（${ctx.department}）` : ""}

${ctx.officeName ?? "[事業所名]"}　${ctx.nurseName ?? "[担当保健師名]"}

件名：${topic}について

[案内本文：3〜5文。目的・内容・お願いを丁寧に説明。内容・要点を必ず反映すること]

ご不明な点は健康管理室までお問い合わせください。${content}${notes}`;

    case "form-with-reply":
      return `あなたは産業保健師です。${topic}に関する案内文＋切り取り回答票を作成してください。
備考に記載された内容（期限・提出先・オプション選択肢等）を正確に反映してください。
必ず以下の構成でそのまま使えるA4文書として出力してください：

令和○年○月○日

従業員各位

${ctx.officeName ?? "[事業所名]"}　${ctx.nurseName ?? "[担当保健師名]"}

件名：${topic}について

[案内本文：3〜5文。目的・内容・お願いを丁寧に説明]

ご不明な点は健康管理室までお問い合わせください。

━━━━━━━━━ 切り取り ━━━━━━━━━

${topic} 回答票

氏名：＿＿＿＿＿＿＿＿＿＿＿　部署：＿＿＿＿＿＿＿＿＿＿

希望：　□ 希望する　　□ 希望しない

[備考にオプション選択肢がある場合は選択欄を追加する]

備考・希望内容：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿

提出期限：[備考から読み取る]　提出先：[備考から読み取る]${content}${notes}`;

    case "business-formal":
      return `あなたは産業保健師です。${topic}に関するビジネス正式文書を「記〜以上」形式で作成してください。
必ず以下の形式を正確に守って出力してください：

令和○年○月○日

${ctx.officeName ? `${ctx.officeName} 御中` : "[宛先] 御中"}

件名：${topic}について

[本文：2〜3行で趣旨を丁寧に記述]

　　　　記

一　[具体的な事項1]
二　[具体的な事項2]
三　[必要な場合のみ事項3]

　　　　以上

${ctx.nurseName ?? "[担当保健師名]"}${content}${notes}`;
  }
}

const VALID_TYPES: DocType[] = [
  "mail-notice",
  "formal-notice",
  "form-with-reply",
  "business-formal",
];

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const body = await req.json();
  const type = body.type as DocType;
  const context: Context = body.context ?? {};

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "不正なtypeです" }, { status: 400 });
  }

  const prompt = buildPrompt(type, context);
  const maxTokens = (type === "form-with-reply" || type === "business-formal" || type === "formal-notice") ? 1024 : 512;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("[generate] Gemini API error:", err);
    return NextResponse.json({ error: "文書の生成に失敗しました。しばらくしてから再度お試しください。" }, { status: 502 });
  }

  const data = await response.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return NextResponse.json({ text });
}
