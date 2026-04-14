-- ============================================================
-- ストレスチェック結果テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS stress_checks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  check_year      INTEGER NOT NULL,
  result_category TEXT NOT NULL,   -- 通常 / 要注意 / 高ストレス
  needs_interview BOOLEAN NOT NULL DEFAULT false,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE stress_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can select stress_checks" ON stress_checks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can insert stress_checks" ON stress_checks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated can update stress_checks" ON stress_checks
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated can delete stress_checks" ON stress_checks
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 復職支援記録テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS return_to_work (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id              UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  phase                    TEXT NOT NULL DEFAULT '休職中',  -- 休職中 / 試し出勤 / 復職済 / 復職プラン策定中
  leave_start_date         DATE,
  return_date              DATE,
  diagnosis                TEXT,
  work_restrictions        TEXT,
  physician_interview_date DATE,
  physician_notes          TEXT,
  doctor_certificate_notes TEXT,
  return_plan              TEXT,
  notes                    TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE return_to_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can select return_to_work" ON return_to_work
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated can insert return_to_work" ON return_to_work
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated can update return_to_work" ON return_to_work
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated can delete return_to_work" ON return_to_work
  FOR DELETE TO authenticated USING (true);
