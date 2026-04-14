import type { Metadata } from "next";
import Link from "next/link";
import NewEmployeeForm from "./_components/NewEmployeeForm";
import { CARD_STYLE } from "@/lib/styles";

export const metadata: Metadata = {
  title: "従業員登録 | さんぽかるて",
};

const card: React.CSSProperties = { ...CARD_STYLE, padding: "24px" };

export default function NewEmployeePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* パンくず */}
      <nav style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
        <Link
          href="/employees"
          style={{ color: "var(--color-text-info)", textDecoration: "none" }}
        >
          従業員一覧
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>新規登録</span>
      </nav>

      <div>
        <h1
          style={{
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "-0.3px",
          }}
        >
          従業員を登録する
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "var(--muted-foreground)",
            marginTop: "2px",
          }}
        >
          基本情報を入力してください。健診データは登録後のカルテ画面から追加できます。
        </p>
      </div>

      <div style={card}>
        <NewEmployeeForm />
      </div>
    </div>
  );
}
