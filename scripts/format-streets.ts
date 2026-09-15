/**
 * Rewrites the GeoJSON fetched from the Dresden WFS into a diff-friendly shape:
 * features ordered by street identifier and one property per line.
 *
 * The export timestamp and the feature id are dropped. Both are artefacts of the
 * export run rather than data about a street, and both change often enough to
 * bury any real change. `str_ident` identifies a street across runs.
 */

interface StreetFeature {
  id?: number;
  geometry: { type: string; coordinates: unknown[] };
  properties: { str_ident: string; fme_transfer_date?: string };
}

interface StreetCollection {
  features: StreetFeature[];
}

const INDENT = "  ";

const isNumber = (value: unknown) => typeof value === "number";

/** A position or a whole line segment, i.e. the parts nobody reads line by line. */
const isCoordinates = (value: unknown[]) =>
  value.every(
    (entry) =>
      isNumber(entry) || (Array.isArray(entry) && entry.every(isNumber)),
  );

/**
 * Identifiers are zero-padded digits, so a plain comparison orders them
 * numerically without depending on the runner's locale.
 */
function byIdentifier(a: StreetFeature, b: StreetFeature) {
  if (a.properties.str_ident === b.properties.str_ident) return 0;
  return a.properties.str_ident < b.properties.str_ident ? -1 : 1;
}

/**
 * The segments of a MultiLineString carry no order in GeoJSON and the WFS emits
 * them in a different order from run to run. Sorting them keeps a street that
 * did not change out of the diff.
 */
function sortSegments(geometry: StreetFeature["geometry"]) {
  if (geometry.type !== "MultiLineString") return geometry;

  const coordinates = [...geometry.coordinates].sort((a, b) =>
    JSON.stringify(a) < JSON.stringify(b) ? -1 : 1,
  );
  return { ...geometry, coordinates };
}

function serialize(value: unknown, indent: string): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    if (isCoordinates(value)) return JSON.stringify(value);
    return block(
      value.map((entry) => serialize(entry, indent + INDENT)),
      "[]",
      indent,
    );
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";
    return block(
      entries.map(
        ([key, entry]) =>
          `${JSON.stringify(key)}: ${serialize(entry, indent + INDENT)}`,
      ),
      "{}",
      indent,
    );
  }

  return JSON.stringify(value);
}

function block(parts: string[], brackets: string, indent: string): string {
  const inner = indent + INDENT;
  return `${brackets[0]}\n${parts.map((part) => inner + part).join(",\n")}\n${indent}${brackets[1]}`;
}

export function formatStreets(geojson: unknown): string {
  const collection = geojson as StreetCollection;

  const features = collection.features
    .map((feature) => {
      const stripped = { ...feature, properties: { ...feature.properties } };
      delete stripped.id;
      delete stripped.properties.fme_transfer_date;
      return { ...stripped, geometry: sortSegments(feature.geometry) };
    })
    .sort(byIdentifier);

  return `${serialize({ ...collection, features }, "")}\n`;
}

if (import.meta.main) {
  const path = process.argv[2] ?? "data/streets.json";
  await Bun.write(path, formatStreets(JSON.parse(await Bun.file(path).text())));
}
