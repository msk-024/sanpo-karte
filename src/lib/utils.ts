import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind クラスをマージするユーティリティ（shadcn/ui 互換） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 生年月日から現在の年齢を計算する
 */
export function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const bd = new Date(birthDate);
  let age = today.getFullYear() - bd.getFullYear();
  const notYet =
    today.getMonth() < bd.getMonth() ||
    (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate());
  if (notYet) age--;
  return age;
}

/**
 * 日付文字列を日本語表記にフォーマットする（例：2024年4月1日）
 */
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * 日付文字列をスラッシュ区切りにフォーマットする（例：2024/4/1）
 */
export function formatDateSlash(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
