import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import type {
  HistoricalEra,
  StreetCategory,
  StreetFeature,
  StreetProperties,
} from "./types";

export interface WFSFeatureProperties {
  str_ident: string;
  strasse: string;
  strasse_kurz: string;
  person: string | null;
  zusatz: string | null;
  geb: string | null;
  gest: string | null;
  weiblich: string | null;
}

const CATEGORY_PATTERNS: Record<StreetCategory, RegExp> = {
  kuenstler: /maler|bildhauer|grafik|künstler|architekt|schauspieler/i,
  schriftsteller: /dichter|schriftsteller|autor|journalist|literat/i,
  wissenschaftler:
    /professor|physiker|chemiker|wissenschaft|forscher|gelehrter|arzt|ärztin|medizin|botaniker|historiker/i,
  politiker: /politiker|minister|bürgermeister|staatsmann|stadtverordnet/i,
  musiker:
    /komponist|sänger|musik|kapellmeister|dirigent|pianist|sopranist|organist/i,
  adel: /könig|herzog|kurfürst|prinz|gemahlin|fürst/i,
  paedagoge: /pädagog|lehrer|erzieher|schulrat/i,
  antifaschist: /antifaschist|widerstandskämpfer|Gegner des Naziregimes/i,
  andere: /.*/,
};

function categorizeStreet(zusatz: string | null): StreetCategory | null {
  if (!zusatz) return null;

  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (category === "andere") continue;
    if (pattern.test(zusatz)) {
      return category as StreetCategory;
    }
  }
  return "andere";
}

function parseYear(yearStr: string | null): string | null {
  if (!yearStr) return null;
  const match = yearStr.match(/\d{4}/);
  return match ? match[0] : null;
}

function parseDeathNote(deathStr: string | null): string | null {
  if (!deathStr) return null;
  // Remove the leading "+ " or "† " and the year, keep the rest
  const withoutPrefix = deathStr.replace(/^[+†]\s*/, "");
  const withoutYear = withoutPrefix.replace(/\d{4}\s*/, "").trim();
  return withoutYear || null;
}

export function classifyEra(deathYear: string | null): HistoricalEra {
  if (!deathYear) return "unknown";
  const year = parseInt(deathYear, 10);
  if (isNaN(year)) return "unknown";

  if (year < 1500) return "medieval";
  if (year < 1600) return "century16";
  if (year < 1700) return "century17";
  if (year < 1800) return "century18";
  if (year < 1871) return "preUnification";
  if (year < 1919) return "wilhelmine";
  if (year < 1933) return "weimar";
  if (year < 1946) return "thirdReich";
  if (year < 1990) return "gdr";
  return "postReunification";
}

interface WFSGeometry {
  type: string;
  coordinates: number[][] | number[][][];
}

interface WFSFeature {
  type: string;
  id: number;
  geometry: WFSGeometry;
  properties: WFSFeatureProperties;
}

export interface WFSGeoJSON {
  type: string;
  features: WFSFeature[];
}

export function parseGeoJSON(
  geojson: WFSGeoJSON,
): FeatureCollection<LineString | MultiLineString, StreetProperties> {
  const features: StreetFeature[] = geojson.features.map((feature) => {
    const raw = feature.properties;
    const hasPerson = Boolean(raw.person?.trim());
    const isFemale = hasPerson ? raw.weiblich === "ja" : null;

    // Explicitly recreate geometry to ensure proper structure
    const geometry: LineString | MultiLineString =
      feature.geometry.type === "MultiLineString"
        ? {
            type: "MultiLineString" as const,
            coordinates: feature.geometry.coordinates as number[][][],
          }
        : {
            type: "LineString" as const,
            coordinates: feature.geometry.coordinates as number[][],
          };

    return {
      type: "Feature" as const,
      geometry,
      properties: {
        id: feature.id,
        strIdent: raw.str_ident,
        name: raw.strasse,
        nameShort: raw.strasse_kurz,
        person: hasPerson ? raw.person : null,
        description: raw.zusatz || null,
        birthYear: parseYear(raw.geb),
        deathYear: parseYear(raw.gest),
        deathNote: parseDeathNote(raw.gest),
        isFemale,
        category: hasPerson ? categorizeStreet(raw.zusatz) : null,
        era: hasPerson ? classifyEra(parseYear(raw.gest)) : null,
      },
    };
  });

  return { type: "FeatureCollection", features };
}

export function filterFeatures(
  data: FeatureCollection<LineString | MultiLineString, StreetProperties>,
  showAllStreets: boolean,
  genderFilter: "all" | "female" | "male",
  categoryFilter: StreetCategory | "all",
  eraFilter: HistoricalEra | "all",
): FeatureCollection<LineString | MultiLineString, StreetProperties> {
  const filtered = data.features.filter((feature) => {
    const { person, isFemale, category, era } = feature.properties;

    if (!showAllStreets && !person) return false;

    if (person) {
      if (genderFilter === "female" && isFemale !== true) return false;
      if (genderFilter === "male" && isFemale !== false) return false;
      if (categoryFilter !== "all" && category !== categoryFilter) return false;
      if (eraFilter !== "all" && era !== eraFilter) return false;
    }

    return true;
  });

  return {
    type: "FeatureCollection",
    features: filtered,
  };
}
