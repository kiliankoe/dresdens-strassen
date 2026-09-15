import { describe, expect, test } from "bun:test";
import { formatStreets } from "./format-streets.ts";

function collection(...features: unknown[]) {
  return { type: "FeatureCollection", features };
}

function street(strIdent: string, extra: Record<string, unknown> = {}) {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [[13.1, 51.1]] },
    id: Number(strIdent),
    properties: {
      str_ident: strIdent,
      strasse: `Straße ${strIdent}`,
      fme_transfer_date: "05.09.2026 17:40:02",
      ...extra,
    },
  };
}

describe("formatStreets", () => {
  test("preserves the data apart from the export timestamp and the feature id", () => {
    const input = collection(
      street("00002", { person: "Jemand" }),
      street("00001"),
    );

    const parsed = JSON.parse(formatStreets(input));

    expect(parsed).toEqual(
      collection(
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [[13.1, 51.1]] },
          properties: { str_ident: "00001", strasse: "Straße 00001" },
        },
        {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [[13.1, 51.1]] },
          properties: {
            str_ident: "00002",
            strasse: "Straße 00002",
            person: "Jemand",
          },
        },
      ),
    );
  });

  test("orders features by street identifier", () => {
    const input = collection(street("00010"), street("00002"), street("00001"));

    const parsed = JSON.parse(formatStreets(input));

    expect(
      parsed.features.map(
        (f: { properties: { str_ident: string } }) => f.properties.str_ident,
      ),
    ).toEqual(["00001", "00002", "00010"]);
  });

  test("keeps each property on its own line", () => {
    const output = formatStreets(collection(street("00001", { person: null })));

    expect(output).toContain(
      '\n        "str_ident": "00001",\n        "strasse": "Straße 00001",\n        "person": null\n',
    );
  });

  test("keeps each line segment on a single line", () => {
    const multi = {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: [
          [
            [13.1, 51.1],
            [13.2, 51.2],
          ],
          [[13.3, 51.3]],
        ],
      },
      id: 1,
      properties: { str_ident: "00001" },
    };

    const output = formatStreets(collection(multi));

    expect(output).toContain(
      "\n          [[13.1,51.1],[13.2,51.2]],\n          [[13.3,51.3]]\n",
    );
  });

  test("orders the segments of a multi-part street deterministically", () => {
    const segments = [
      [
        [13.3, 51.3],
        [13.4, 51.4],
      ],
      [
        [13.1, 51.1],
        [13.2, 51.2],
      ],
      [
        [13.2, 51.2],
        [13.3, 51.3],
      ],
    ];
    const multi = (coordinates: number[][][]) => ({
      type: "Feature",
      geometry: { type: "MultiLineString", coordinates },
      id: 1,
      properties: { str_ident: "00001" },
    });

    const output = formatStreets(collection(multi(segments)));

    expect(formatStreets(collection(multi([...segments].reverse())))).toBe(
      output,
    );
    expect(output).toContain(
      "\n          [[13.1,51.1],[13.2,51.2]],\n          [[13.2,51.2],[13.3,51.3]],\n          [[13.3,51.3],[13.4,51.4]]\n",
    );
  });

  test("leaves the input untouched", () => {
    const input = collection(street("00001"));
    const before = structuredClone(input);

    formatStreets(input);

    expect(input).toEqual(before);
  });

  test("ends with a newline", () => {
    expect(formatStreets(collection(street("00001")))).toEndWith("}\n");
  });

  test("is idempotent", () => {
    const once = formatStreets(collection(street("00002"), street("00001")));

    expect(formatStreets(JSON.parse(once))).toBe(once);
  });
});
