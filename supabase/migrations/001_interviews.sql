-- 面談記録テーブル
CREATE TABLE IF NOT EXISTS interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  interviewed_at  DATE NOT NULL,
  interview_type  TEXT NOT NULL,   -- routine / mental / referral / other
  content         TEXT NOT NULL,   -- 面談内容
  plan            TEXT,            -- 今後の方針
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS（既存テーブルと同方針：認証ユーザーのみ可）
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can select" ON interviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can insert" ON interviews
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated can update" ON interviews
  FOR UPDATE TO authenticated USING (true);
