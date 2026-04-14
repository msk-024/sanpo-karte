import { z } from "zod";

const currentYear = new Date().getFullYear();

export const healthCheckSchema = z.object({
  check_year: z
    .number({ error: "年度を入力してください" })
    .int()
    .min(2000, "2000年以降を入力してください")
    .max(currentYear, `${currentYear}年以前を入力してください`),
  judgment: z.enum(["A", "B", "C", "D"], {
    error: () => ({ message: "総合判定を選択してください" }),
  }),
  bmi: z
    .number({ error: "数値で入力してください" })
    .min(10).max(60)
    .optional()
    .nullable(),
  blood_pressure_sys: z
    .number({ error: "数値で入力してください" })
    .int().min(60).max(250)
    .optional()
    .nullable(),
  blood_pressure_dia: z
    .number({ error: "数値で入力してください" })
    .int().min(40).max(150)
    .optional()
    .nullable(),
  blood_sugar: z
    .number({ error: "数値で入力してください" })
    .min(50).max(600)
    .optional()
    .nullable(),
  total_cholesterol: z
    .number({ error: "数値で入力してください" })
    .min(50).max(600)
    .optional()
    .nullable(),
  notes: z.string().max(500, "500字以内で入力してください").optional().or(z.literal("")),
});

export type HealthCheckFormValues = z.infer<typeof healthCheckSchema>;
