import type { FeatureCollection, LineString, MultiLineString } from "geojson";
import { useEffect, useMemo, useState } from "react";
import geojsonData from "../data/streets.json";
import "./App.css";
import { AboutModal } from "./components/AboutModal";
import { InfoPanel } from "./components/InfoPanel";
import { Legend } from "./components/Legend";
import { Map } from "./components/Map";
import { filterFeatures, parseGeoJSON, type WFSGeoJSON } from "./lib/data";
import type { FilterState, StreetProperties } from "./lib/types";

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
        onAboutClick={() => setIsAboutOpen(true)}
      />
      <InfoPanel street={selectedStreet} onClose={handleCloseInfo} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default App;
