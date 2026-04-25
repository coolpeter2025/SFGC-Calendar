export type Category = "service" | "youth" | "choir" | "ministry" | "special";

export const CATEGORIES: Record<Category, { label: string; color: string; dot: string }> = {
  service: { label: "Service", color: "#b45309", dot: "#d97706" },
  youth: { label: "Youth", color: "#0e7490", dot: "#0891b2" },
  choir: { label: "Choir", color: "#7c3aed", dot: "#8b5cf6" },
  ministry: { label: "Ministry", color: "#15803d", dot: "#16a34a" },
  special: { label: "Special", color: "#be123c", dot: "#e11d48" },
};

export function categorize(title: string): Category {
  const t = (title || "").toLowerCase();
  if (/youth|kids|children|teen|lock-in/.test(t)) return "youth";
  if (/choir|music|band|rehearsal|hymn/.test(t)) return "choir";
  if (/worship|service|prayer|mass|communion|sermon|sunday|chapel/.test(t)) return "service";
  if (/study|bible|men'?s|women'?s|breakfast|ministry|fellowship|small group|class/.test(t))
    return "ministry";
  return "special";
}
