import Papa from "papaparse";
import type {
  FeatureCollection,
  LineString,
  MultiLineString,
  Position,
} from "geojson";
import type {
  StreetRawData,
  StreetFeature,
  StreetProperties,
  StreetCategory,
} from "./types";

const CATEGORY_PATTERNS: Record<StreetCategory, RegExp> = {
  kuenstler: /maler|bildhauer|grafik|künstler|architekt/i,
  schriftsteller: /dichter|schriftsteller|autor|journalist|literat/i,
  musiker: /komponist|sänger|musik|kapellmeister|dirigent/i,
  wissenschaftler:
    /professor|physiker|chemiker|wissenschaft|forscher|gelehrter|arzt|medizin/i,
  politiker: /politiker|minister|bürgermeister|staatsmann|stadtverordnet/i,
  antifaschist: /antifaschist|widerstandskämpfer/i,
  adel: /könig|herzog|kurfürst|prinz|gemahlin|fürst/i,
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

function parseWKT(wkt: string): LineString | MultiLineString | null {
  if (!wkt) return null;

  const cleaned = wkt.replace(/^SRID=\d+;/, "");

  if (cleaned.startsWith("MULTILINESTRING")) {
    const match = cleaned.match(/MULTILINESTRING\(\((.+)\)\)/);
    if (!match) return null;

    const lineStrings = match[1].split("),(").map((ls) => {
      return ls
        .replace(/^\(|\)$/g, "")
        .split(",")
        .map((coord) => {
          const [lng, lat] = coord.trim().split(" ").map(Number);
          return [lng, lat] as Position;
        });
    });

    return {
      type: "MultiLineString",
      coordinates: lineStrings,
    };
  }

  if (cleaned.startsWith("LINESTRING")) {
    const match = cleaned.match(/LINESTRING\((.+)\)/);
    if (!match) return null;

    const coordinates = match[1].split(",").map((coord) => {
      const [lng, lat] = coord.trim().split(" ").map(Number);
      return [lng, lat] as Position;
    });

    return {
      type: "LineString",
      coordinates,
    };
  }

  return null;
}

function parseYear(yearStr: string | null): string | null {
  if (!yearStr) return null;
  const match = yearStr.match(/\d{4}/);
  return match ? match[0] : null;
}

export function parseCSV(
  csvText: string,
): FeatureCollection<LineString | MultiLineString, StreetProperties> {
  const result = Papa.parse<StreetRawData>(csvText, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
  });

  const features: StreetFeature[] = [];

  for (const row of result.data) {
    const geometry = parseWKT(row.geom);
    if (!geometry) continue;

    const hasPerson = Boolean(row.person && row.person.trim());
    const isFemale = hasPerson ? row.weiblich === "ja" : null;

    const properties: StreetProperties = {
      id: parseInt(row.id, 10),
      strIdent: row.str_ident,
      name: row.strasse,
      nameShort: row.strasse_kurz,
      person: hasPerson ? row.person : null,
      description: row.zusatz || null,
      birthYear: parseYear(row.geb),
      deathYear: parseYear(row.gest),
      isFemale,
      category: hasPerson ? categorizeStreet(row.zusatz) : null,
    };

    features.push({
      type: "Feature",
      geometry,
      properties,
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

export function filterFeatures(
  data: FeatureCollection<LineString | MultiLineString, StreetProperties>,
  showAllStreets: boolean,
  genderFilter: "all" | "female" | "male",
  categoryFilter: StreetCategory | "all",
): FeatureCollection<LineString | MultiLineString, StreetProperties> {
  const filtered = data.features.filter((feature) => {
    const { person, isFemale, category } = feature.properties;

    if (!showAllStreets && !person) return false;

    if (person) {
      if (genderFilter === "female" && isFemale !== true) return false;
      if (genderFilter === "male" && isFemale !== false) return false;
      if (categoryFilter !== "all" && category !== categoryFilter) return false;
    }

    return true;
  });

  return {
    type: "FeatureCollection",
    features: filtered,
  };
}
