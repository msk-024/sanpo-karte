import { z } from "zod";

const today = new Date().toISOString().split("T")[0];

export const interviewSchema = z.object({
  interviewed_at: z
    .string()
    .min(1, "面談日は必須です")
    .refine((v) => v <= today, "未来の日付は入力できません"),
  interview_type: z.enum(["routine", "mental", "referral", "other"], {
    error: () => ({ message: "面談種別を選択してください" }),
  }),
  content: z
    .string()
    .min(1, "面談内容は必須です")
    .max(2000, "2000字以内で入力してください"),
  plan: z.string().max(1000, "1000字以内で入力してください").optional().or(z.literal("")),
});

export type InterviewFormValues = z.infer<typeof interviewSchema>;
