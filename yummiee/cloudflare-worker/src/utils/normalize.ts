export function normalizeIngredient(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.trim().toLowerCase();
  s = s.replace(/[^a-z0-9\s]/g, "");
  s = s.replace(/\s+/g, " ").trim();

  if (s.length === 0) return "";

  if (s === "curd" || s === "yogurt" || s === "yoghurt" || s === "dahi") return "curd";
  if (s === "potato" || s === "potatoes" || s === "aloo") return "potato";
  if (s === "rice" || s === "chawal") return "rice";
  if (s === "paneer" || s === "cottage cheese") return "paneer";
  if (s === "onion" || s === "onions") return "onion";
  if (s === "tomato" || s === "tomatoes") return "tomato";
  if (s === "egg" || s === "eggs") return "egg";
  if (s === "carrot" || s === "carrots") return "carrot";
  if (s.includes("chicken")) return "chicken";
  if (s.includes("garlic")) return "garlic";
  if (s.includes("spinach")) return "spinach";
  if (s.includes("cheese") && !s.includes("cottage")) return "cheese";

  if (s.endsWith("es") && s.length > 4) {
    s = s.substring(0, s.length - 2);
  } else if (s.endsWith("s") && s.length > 3 && !s.endsWith("ss")) {
    s = s.substring(0, s.length - 1);
  }

  return s;
}

export function isIngredientMatched(normRecIng: string, userSet: Set<string>): boolean {
  if (!normRecIng) return false;

  for (const userIng of userSet) {
    if (!userIng) continue;
    if (normRecIng === userIng) return true;
    if (normRecIng.includes(userIng) || userIng.includes(normRecIng)) return true;
  }
  return false;
}
