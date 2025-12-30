import type { Feature, LineString, MultiLineString } from "geojson";

export interface StreetRawData {
  id: string;
  str_ident: string;
  strasse: string;
  strasse_kurz: string;
  person: string;
  zusatz: string;
  geb: string;
  gest: string;
  weiblich: string;
  zusatz_komplett: string;
  bem: string;
  guelt_ab: string;
  erf_dat: string;
  aend_dat: string;
  geom: string;
  fme_transfer_date: string;
}

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
  | "musiker"
  | "wissenschaftler"
  | "politiker"
  | "antifaschist"
  | "adel"
  | "andere";

export const CATEGORY_LABELS: Record<StreetCategory, string> = {
  kuenstler: "Künstler:innen",
  schriftsteller: "Schriftsteller:innen",
  musiker: "Musiker:innen",
  wissenschaftler: "Wissenschaftler:innen",
  politiker: "Politiker:innen",
  antifaschist: "Antifaschist:innen",
  adel: "Adel",
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
