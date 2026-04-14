import { z } from "zod";

const today = new Date().toISOString().split("T")[0];

export const employeeSchema = z.object({
  name: z.string().min(1, "氏名は必須です").max(50, "50字以内で入力してください"),
  name_kana: z
    .string()
    .max(50, "50字以内で入力してください")
    .regex(/^[ァ-ヶー\s　]*$/, "カタカナで入力してください")
    .optional()
    .or(z.literal("")),
  department: z.string().max(50, "50字以内で入力してください").optional().or(z.literal("")),
  birth_date: z
    .string()
    .refine((v) => !v || v <= today, "未来の日付は入力できません")
    .refine((v) => !v || v >= "1920-01-01", "1920年以降の日付を入力してください")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other", ""]).optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
