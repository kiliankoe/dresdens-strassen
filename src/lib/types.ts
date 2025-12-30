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
  isFemale: boolean | null;
  category: StreetCategory | null;
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

export const COLORS = {
  female: "#7C3AED",
  male: "#D97706",
  neutral: "#6B7280",
  highlight: "#DC2626",
} as const;

export interface FilterState {
  showAllStreets: boolean;
  genderFilter: "all" | "female" | "male";
  categoryFilter: StreetCategory | "all";
}
