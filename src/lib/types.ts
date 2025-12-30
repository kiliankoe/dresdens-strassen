import type { Feature, LineString, MultiLineString } from "geojson";

export interface StreetProperties {
  id: number;
  strIdent: string;
  name: string;
  nameShort: string;
  person: string | null;
  description: string | null;
  birthYear: string | null;
  deathYear: string | null;
  deathNote: string | null;
  isFemale: boolean | null;
  category: StreetCategory | null;
  era: HistoricalEra | null;
}

export type StreetFeature = Feature<
  LineString | MultiLineString,
  StreetProperties
>;

export type StreetCategory =
  | "kuenstler"
  | "schriftsteller"
  | "wissenschaftler"
  | "politiker"
  | "musiker"
  | "adel"
  | "paedagoge"
  | "antifaschist"
  | "andere";

export type ViewMode = "gender" | "era";

export type HistoricalEra =
  | "medieval"
  | "century16"
  | "century17"
  | "century18"
  | "preUnification"
  | "wilhelmine"
  | "weimar"
  | "thirdReich"
  | "gdr"
  | "postReunification"
  | "unknown";

export const CATEGORY_LABELS: Record<StreetCategory, string> = {
  kuenstler: "Künstler:innen",
  schriftsteller: "Schriftsteller:innen",
  wissenschaftler: "Wissenschaftler:innen",
  politiker: "Politiker:innen",
  musiker: "Musiker:innen",
  adel: "Adel",
  paedagoge: "Pädagog:innen",
  antifaschist: "Antifaschist:innen",
  andere: "Andere",
};

export const ERA_LABELS: Record<HistoricalEra, string> = {
  medieval: "Mittelalter",
  century16: "16. Jahrhundert",
  century17: "17. Jahrhundert",
  century18: "18. Jahrhundert",
  preUnification: "1800-1870",
  wilhelmine: "Kaiserzeit (1871-1918)",
  weimar: "Weimarer Rep. (1919-1932)",
  thirdReich: "NS-Zeit (1933-1945)",
  gdr: "DDR (1946-1989)",
  postReunification: "Nach 1990",
  unknown: "Unbekannt",
};

export const ERA_COLORS: Record<HistoricalEra, string> = {
  medieval: "#1e3a5f",
  century16: "#2563eb",
  century17: "#0891b2",
  century18: "#059669",
  preUnification: "#65a30d",
  wilhelmine: "#ca8a04",
  weimar: "#ea580c",
  thirdReich: "#dc2626",
  gdr: "#be185d",
  postReunification: "#7c3aed",
  unknown: "#9ca3af",
};

export const ERA_ORDER: HistoricalEra[] = [
  "medieval",
  "century16",
  "century17",
  "century18",
  "preUnification",
  "wilhelmine",
  "weimar",
  "thirdReich",
  "gdr",
  "postReunification",
  "unknown",
];

export const COLORS = {
  female: "#7C3AED",
  male: "#D97706",
  neutral: "#6B7280",
  highlight: "#DC2626",
} as const;

export interface FilterState {
  showAllStreets: boolean;
  viewMode: ViewMode;
  genderFilter: "all" | "female" | "male";
  categoryFilter: StreetCategory | "all";
  eraFilter: HistoricalEra | "all";
}
