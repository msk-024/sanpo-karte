import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ExtractedSchema = z.object({
  check_year: z.number().int().min(2000).max(2100).nullable(),
  judgment: z.enum(["A", "B", "C", "D"]).nullable(),
  bmi: z.number().min(10).max(60).nullable(),
  blood_pressure_sys: z.number().int().min(60).max(250).nullable(),
  blood_pressure_dia: z.number().int().min(40).max(150).nullable(),
  blood_sugar: z.number().min(50).max(600).nullable(),
  total_cholesterol: z.number().min(50).max(600).nullable(),
  notes: z.string().max(500).nullable(),
});

const EXTRACT_PROMPT = `この画像（または文書）は日本の定期健康診断結果票です。
以下のフィールドを読み取り、JSONのみ返してください（説明・コードブロック不要）。
値が読み取れない・記載がない場合は null にしてください。

{
  "check_year": <実施年度（西暦4桁の整数）。「令和○年」の場合は西暦に変換>,
  "judgment": <総合判定。"A"/"B"/"C"/"D" のいずれか。C1/C2→"C"、D1/D2→"D" に正規化>,
  "bmi": <BMI（小数点1桁の数値）>,
  "blood_pressure_sys": <収縮期血圧 mmHg（整数）>,
  "blood_pressure_dia": <拡張期血圧 mmHg（整数）>,
  "blood_sugar": <空腹時血糖 mg/dL（数値）。HbA1cのみの場合はnull>,
  "total_cholesterol": <総コレステロール mg/dL（数値）>,
  "notes": <所見・異常項目・特記事項をまとめたテキスト。なければnull>
}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "ファイルが指定されていません" }, { status: 400 });
  }

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "JPEG・PNG・WebP・PDF のいずれかを選択してください" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  // Gemini は画像・PDF ともに inline_data で統一
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64,
                },
              },
              { text: EXTRACT_PROMPT },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 512 },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("[extract-health-check] Gemini API error:", err);
    return NextResponse.json({ error: "読み取りに失敗しました。しばらくしてから再度お試しください。" }, { status: 502 });
  }

  const data = await response.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "結果の解析に失敗しました" }, { status: 500 });
  }

  try {
    const raw = JSON.parse(jsonMatch[0]);
    const parsed = ExtractedSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("[extract-health-check] schema validation failed", parsed.error.issues);
      return NextResponse.json({ error: "読み取り結果の検証に失敗しました" }, { status: 500 });
    }
    return NextResponse.json({ extracted: parsed.data });
  } catch {
    return NextResponse.json({ error: "JSONの解析に失敗しました" }, { status: 500 });
  }
}
