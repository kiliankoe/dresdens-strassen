import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import type { StreetProperties, ViewMode } from "../lib/types";
import { COLORS, ERA_COLORS } from "../lib/types";

interface MapProps {
  data: FeatureCollection<LineString | MultiLineString, StreetProperties>;
  onStreetClick: (properties: StreetProperties | null) => void;
  selectedStreetId: number | null;
  viewMode: ViewMode;
}

function getLineColorExpression(
  viewMode: ViewMode,
): maplibregl.ExpressionSpecification {
  if (viewMode === "gender") {
    return [
      "case",
      ["==", ["get", "isFemale"], true],
      COLORS.female,
      ["==", ["get", "isFemale"], false],
      COLORS.male,
      COLORS.neutral,
    ];
  }

  return [
    "match",
    ["get", "era"],
    "medieval",
    ERA_COLORS.medieval,
    "century16",
    ERA_COLORS.century16,
    "century17",
    ERA_COLORS.century17,
    "century18",
    ERA_COLORS.century18,
    "preUnification",
    ERA_COLORS.preUnification,
    "wilhelmine",
    ERA_COLORS.wilhelmine,
    "weimar",
    ERA_COLORS.weimar,
    "thirdReich",
    ERA_COLORS.thirdReich,
    "gdr",
    ERA_COLORS.gdr,
    "postReunification",
    ERA_COLORS.postReunification,
    "unknown",
    ERA_COLORS.unknown,
    COLORS.neutral,
  ];
}

const DRESDEN_CENTER: [number, number] = [13.7372, 51.0504];
const INITIAL_ZOOM = 12;

export function Map({
  data,
  onStreetClick,
  selectedStreetId,
  viewMode,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (map.current) {
      map.current.resize();
      return;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center: DRESDEN_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource("streets", {
        type: "geojson",
        data: data,
      });

      map.current.addLayer({
        id: "streets-highlight",
        type: "line",
        source: "streets",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": COLORS.highlight,
          "line-width": 10,
          "line-opacity": [
            "case",
            ["==", ["get", "id"], selectedStreetId ?? -1],
            1,
            0,
          ],
        },
      });

      map.current.addLayer({
        id: "streets-line",
        type: "line",
        source: "streets",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": getLineColorExpression(viewMode),
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      map.current.addLayer({
        id: "streets-hitarea",
        type: "line",
        source: "streets",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "transparent",
          "line-width": 16,
          "line-opacity": 0,
        },
      });
    });

    map.current.on("click", "streets-hitarea", (e) => {
      e.preventDefault();
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        onStreetClick(feature.properties as StreetProperties);
      }
    });

    map.current.on("click", (e) => {
      if (!map.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["streets-hitarea"],
      });
      if (features.length === 0) {
        onStreetClick(null);
      }
    });

    map.current.on("mouseenter", "streets-hitarea", () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "pointer";
      }
    });

    map.current.on("mouseleave", "streets-hitarea", () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = "";
      }
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const source = map.current.getSource("streets") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.setPaintProperty("streets-highlight", "line-opacity", [
      "case",
      ["==", ["get", "id"], selectedStreetId ?? -1],
      1,
      0,
    ]);
  }, [selectedStreetId]);

  useEffect(() => {
    if (!map.current) return;
    if (!map.current.getLayer("streets-line")) return;

    map.current.setPaintProperty(
      "streets-line",
      "line-color",
      getLineColorExpression(viewMode),
    );
  }, [viewMode]);

  return <div ref={mapContainer} className="map-container" />;
}
