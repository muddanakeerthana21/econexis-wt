// =======================================================
// EcoNexis - Utility Helper Functions
// =======================================================

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function generatePickupId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ECO-${randomNum}`;
}

export function calculateEcoPoints(itemCategory, weightKg = 1) {
  const multipliers = {
    "Smartphones": 50,
    "Laptops": 150,
    "Tablets": 80,
    "TVs": 200,
    "Accessories": 25,
    "Batteries": 40,
    "Cables": 20,
    "Other Electronics": 30
  };
  const base = multipliers[itemCategory] || 30;
  return Math.round(base * Math.max(1, weightKg));
}

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString();
}
