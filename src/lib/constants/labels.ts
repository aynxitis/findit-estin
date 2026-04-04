export const CATEGORY_LABELS: Record<string, string> = {
  keys: "Keys",
  card: "Card / ID",
  phone: "Phone",
  bag: "Bag",
  clothing: "Clothing",
  electronics: "Electronics",
  other: "Other",
};

export const CATEGORY_ICONS: Record<string, string> = {
  keys: "🔑",
  card: "🪪",
  phone: "📱",
  bag: "🎒",
  clothing: "👕",
  electronics: "💻",
  other: "📦",
};

export const LOCATION_LABELS: Record<string, string> = {
  library: "Library",
  foyer: "Foyer (école)",
  td_halls: "TD Halls",
  tp_halls: "TP Halls",
  restau: "Restau",
  res_foyer: "Foyer (résidence)",
  unknown: "Not sure",
};

export const WHERE_LEFT_LABELS: Record<string, string> = {
  with_me: "Still with me",
  admin: "Handed to admin",
  left_there: "Left where found",
};

export const SPOT_OPTIONS = {
  school: [
    { value: "library", label: "📚 Library" },
    { value: "foyer", label: "🪑 Foyer" },
    { value: "td_halls", label: "🚪 TD Halls" },
    { value: "tp_halls", label: "🔬 TP Halls" },
    { value: "other", label: "📦 Other" },
  ],
  residence: [
    { value: "restau", label: "🍽️ Restau" },
    { value: "res_foyer", label: "🪑 Foyer" },
    { value: "other", label: "📦 Other" },
  ],
} as const;

export const CATEGORIES = [
  { value: "keys", label: "🔑 Keys" },
  { value: "card", label: "🪪 Card / ID" },
  { value: "phone", label: "📱 Phone" },
  { value: "bag", label: "🎒 Bag" },
  { value: "clothing", label: "👕 Clothing" },
  { value: "electronics", label: "💻 Electronics" },
  { value: "other", label: "📦 Other" },
] as const;

export const ZONES = [
  { value: "school", label: "🏫 École" },
  { value: "residence", label: "🏠 Résidence" },
  { value: "unknown", label: "❓ Not sure" },
] as const;

export const WHERE_LEFT_OPTIONS = [
  { value: "with_me", label: "🙋 I still have it" },
  { value: "admin", label: "🏢 Handed to admin / lost & found desk" },
  { value: "left_there", label: "📍 Left it where I found it" },
] as const;

// Validation arrays
export const VALID_CATEGORIES = ["keys", "card", "phone", "bag", "clothing", "electronics", "other"];
export const VALID_LOCATIONS = ["library", "foyer", "td_halls", "tp_halls", "restau", "res_foyer", "unknown"];
export const VALID_WHERE_LEFT = ["with_me", "admin", "left_there"];
