import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { useEffect, useMemo, useState } from "react";
import geojsonData from "../data/streets.json";
import "./App.css";
import { AboutModal } from "./components/AboutModal";
import { InfoPanel } from "./components/InfoPanel";
import { Legend } from "./components/Legend";
import { Map } from "./components/Map";
import { filterFeatures, parseGeoJSON, type WFSGeoJSON } from "./lib/data";
import type { FilterState, StreetCategory, StreetProperties } from "./lib/types";

type StreetData = FeatureCollection<
  LineString | MultiLineString,
  StreetProperties
>;

function App() {
  const [allData, setAllData] = useState<StreetData | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    showAllStreets: false,
    genderFilter: "all",
    categoryFilter: "all",
  });

  const [selectedStreet, setSelectedStreet] = useState<StreetProperties | null>(
    null,
  );

  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const data = parseGeoJSON(geojsonData as unknown as WFSGeoJSON);
    setAllData(data);
  }, []);

  const filteredData = useMemo(() => {
    if (!allData) return null;
    return filterFeatures(
      allData,
      filters.showAllStreets,
      filters.genderFilter,
      filters.categoryFilter,
    );
  }, [allData, filters]);

  const stats = useMemo(() => {
    if (!allData) return { total: 0, namedAfterPerson: 0, female: 0, male: 0 };

    const total = allData.features.length;
    const namedAfterPerson = allData.features.filter(
      (f) => f.properties.person,
    ).length;
    const female = allData.features.filter(
      (f) => f.properties.isFemale === true,
    ).length;
    const male = allData.features.filter(
      (f) => f.properties.isFemale === false,
    ).length;

    return { total, namedAfterPerson, female, male };
  }, [allData]);

  const categoryCounts = useMemo(() => {
    if (!allData) return {} as Record<StreetCategory, number>;

    const counts: Record<StreetCategory, number> = {
      kuenstler: 0,
      schriftsteller: 0,
      wissenschaftler: 0,
      politiker: 0,
      musiker: 0,
      adel: 0,
      paedagoge: 0,
      antifaschist: 0,
      andere: 0,
    };

    for (const feature of allData.features) {
      const { person, isFemale, category } = feature.properties;
      if (!person || !category) continue;
      if (filters.genderFilter === "female" && isFemale !== true) continue;
      if (filters.genderFilter === "male" && isFemale !== false) continue;
      counts[category]++;
    }

    return counts;
  }, [allData, filters.genderFilter]);

  useEffect(() => {
    if (
      filters.categoryFilter !== "all" &&
      categoryCounts[filters.categoryFilter] === 0
    ) {
      setFilters((f) => ({ ...f, categoryFilter: "all" }));
    }
  }, [categoryCounts, filters.categoryFilter]);

  const handleStreetClick = (properties: StreetProperties | null) => {
    setSelectedStreet(properties);
  };

  const handleCloseInfo = () => {
    setSelectedStreet(null);
  };

  if (!filteredData) {
    return (
      <div className="loading">
        <p>Lade Straßendaten...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Map
        data={filteredData}
        onStreetClick={handleStreetClick}
        selectedStreetId={selectedStreet?.id ?? null}
      />
      <Legend
        filters={filters}
        onFilterChange={setFilters}
        stats={stats}
        categoryCounts={categoryCounts}
        onAboutClick={() => setIsAboutOpen(true)}
      />
      <InfoPanel street={selectedStreet} onClose={handleCloseInfo} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default App;
