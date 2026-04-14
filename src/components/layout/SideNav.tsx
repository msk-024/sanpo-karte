"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";

type NavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const DEFAULT_ITEMS: NavItem[] = [
  { id: "employees", label: "従業員一覧", icon: "👥", href: "/employees" },
  { id: "health", label: "健診結果", icon: "📋", href: "/health" },
  { id: "interviews", label: "面談履歴", icon: "📝", href: "/interviews" },
  { id: "documents", label: "文書作成", icon: "📄", href: "/documents" },
  { id: "reports", label: "レポート", icon: "📊", href: "/reports" },
  { id: "settings", label: "設定", icon: "⚙️", href: "/settings" },
];

const STORAGE_KEY = "sanpo-karte-nav-order";

function loadOrder(): NavItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_ITEMS;
    const ids: string[] = JSON.parse(saved);
    const map = Object.fromEntries(DEFAULT_ITEMS.map((i) => [i.id, i]));
    const ordered = ids.map((id) => map[id]).filter(Boolean);
    // 新しく追加されたアイテムがあれば末尾に追加
    const missing = DEFAULT_ITEMS.filter((i) => !ids.includes(i.id));
    return [...ordered, ...missing];
  } catch {
    return DEFAULT_ITEMS;
  }
}

export default function SideNav() {
  const pathname = usePathname();
  const [items, setItems] = useState<NavItem[]>(DEFAULT_ITEMS);
  const draggingId = useRef<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      setItems(loadOrder());
    });
  }, []);

  function handleDragStart(id: string) {
    draggingId.current = id;
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!draggingId.current || draggingId.current === overId) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === draggingId.current);
      const to = prev.findIndex((i) => i.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleDragEnd() {
    draggingId.current = null;
    // functional updater で最新の state を読み、localStorage に保存
    // 同じ参照を返すので余分な再レンダーは発生しない
    setItems((current) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current.map((i) => i.id)));
      return current;
    });
  }

  return (
    <nav
      style={{
        width: "200px",
        minHeight: "100%",
        borderLeft: "0.5px solid var(--color-border-tertiary)",
        background: "var(--color-background-primary)",
        padding: "12px 0",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          color: "var(--muted-foreground)",
          padding: "0 12px 8px",
        }}
      >
        メニュー
      </p>

      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragEnd={handleDragEnd}
            style={{ padding: "0 8px" }}
          >
            <Link
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "7px 8px",
                borderRadius: "var(--radius-md)",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "var(--color-text-info)" : "var(--foreground)",
                background: isActive
                  ? "var(--color-background-info)"
                  : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                cursor: "grab",
                userSelect: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "var(--color-background-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "15px", lineHeight: 1 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
