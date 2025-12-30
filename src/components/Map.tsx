import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import type { StreetProperties } from "../lib/types";
import { COLORS } from "../lib/types";

interface MapProps {
  data: FeatureCollection<LineString | MultiLineString, StreetProperties>;
  onStreetClick: (properties: StreetProperties | null) => void;
  selectedStreetId: number | null;
}

const DRESDEN_CENTER: [number, number] = [13.7372, 51.0504];
const INITIAL_ZOOM = 12;

export function Map({ data, onStreetClick, selectedStreetId }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
          "line-color": [
            "case",
            ["==", ["get", "isFemale"], true],
            COLORS.female,
            ["==", ["get", "isFemale"], false],
            COLORS.male,
            COLORS.neutral,
          ],
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

    return () => {
      map.current?.remove();
      map.current = null;
    };
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

  return <div ref={mapContainer} className="map-container" />;
}
