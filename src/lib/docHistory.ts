export type DocHistoryItem = {
  id: number;
  topic: string;
  formatLabel: string;
  targetName: string;
  text: string;
  createdAt: string;
};

const HISTORY_KEY = "sanpo-karte-doc-history";
const MAX_HISTORY = 30;

export function saveToHistory(item: Omit<DocHistoryItem, "id" | "createdAt">): void {
  const history = loadHistory();
  const newItem: DocHistoryItem = {
    ...item,
    id: Date.now(),
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function loadHistory(): DocHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DocHistoryItem[];
  } catch {
    return [];
  }
}
