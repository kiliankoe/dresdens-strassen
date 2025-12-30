import { useMemo, useState } from "react";
import type {
  FilterState,
  HistoricalEra,
  StreetCategory,
  ViewMode,
} from "../lib/types";
import {
  CATEGORY_LABELS,
  COLORS,
  ERA_COLORS,
  ERA_LABELS,
  ERA_ORDER,
} from "../lib/types";

interface LegendProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  stats: {
    total: number;
    namedAfterPerson: number;
    female: number;
    male: number;
  };
  categoryCounts: Record<StreetCategory, number>;
  eraCounts: Record<HistoricalEra, number>;
  onAboutClick: () => void;
}

const getInitialExpandedState = () => {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(min-width: 768px)").matches;
};

export function Legend({
  filters,
  onFilterChange,
  stats,
  categoryCounts,
  eraCounts,
  onAboutClick,
}: LegendProps) {
  const [isExpanded, setIsExpanded] = useState(getInitialExpandedState);

  const sortedCategories = useMemo(() => {
    return Object.entries(CATEGORY_LABELS)
      .map(([key, label]) => ({
        key: key as StreetCategory,
        label,
        count: categoryCounts[key as StreetCategory] || 0,
      }))
      .sort((a, b) => {
        if (a.key === "andere" && b.key !== "andere") return 1;
        if (b.key === "andere" && a.key !== "andere") return -1;
        if (a.count === 0 && b.count > 0) return 1;
        if (b.count === 0 && a.count > 0) return -1;
        return b.count - a.count;
      });
  }, [categoryCounts]);

  const sortedEras = useMemo(() => {
    return ERA_ORDER.filter((key) => key !== "unknown" || eraCounts.unknown > 0)
      .filter((key) => eraCounts[key] > 0)
      .map((key) => ({
        key,
        label: ERA_LABELS[key],
        count: eraCounts[key] || 0,
        color: ERA_COLORS[key],
      }));
  }, [eraCounts]);

  const handleViewModeChange = (mode: ViewMode) => {
    onFilterChange({
      ...filters,
      viewMode: mode,
      genderFilter: mode === "era" ? "all" : filters.genderFilter,
      eraFilter: mode === "gender" ? "all" : filters.eraFilter,
    });
  };

  const handleGenderChange = (gender: "all" | "female" | "male") => {
    onFilterChange({ ...filters, genderFilter: gender });
  };

  const handleCategoryChange = (category: StreetCategory | "all") => {
    onFilterChange({ ...filters, categoryFilter: category });
  };

  const handleEraChange = (era: HistoricalEra | "all") => {
    onFilterChange({ ...filters, eraFilter: era });
  };

  const handleShowAllChange = (show: boolean) => {
    onFilterChange({ ...filters, showAllStreets: show });
  };

  return (
    <div className={`legend ${isExpanded ? "expanded" : "collapsed"}`}>
      <button
        className="legend-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? "Legende einklappen" : "Legende ausklappen"}
      >
        <span className="legend-title">Legende</span>
        <span className="legend-icon">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="legend-content">
          <div className="legend-view-toggle">
            <div className="legend-toggle-group">
              <button
                type="button"
                className={`toggle-button ${filters.viewMode === "gender" ? "active" : ""}`}
                onClick={() => handleViewModeChange("gender")}
              >
                Geschlecht
              </button>
              <button
                type="button"
                className={`toggle-button ${filters.viewMode === "era" ? "active" : ""}`}
                onClick={() => handleViewModeChange("era")}
              >
                Epoche
              </button>
            </div>
          </div>

          {filters.viewMode === "gender" ? (
            <section className="legend-section">
              <h3>Geschlecht</h3>
              <div className="legend-options">
                <label className="legend-option">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.genderFilter === "all"}
                    onChange={() => handleGenderChange("all")}
                  />
                  <span>Alle</span>
                </label>
                <label className="legend-option">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.genderFilter === "female"}
                    onChange={() => handleGenderChange("female")}
                  />
                  <span
                    className="color-indicator"
                    style={{ backgroundColor: COLORS.female }}
                  />
                  <span>
                    Weiblich <span className="count">({stats.female})</span>
                  </span>
                </label>
                <label className="legend-option">
                  <input
                    type="radio"
                    name="gender"
                    checked={filters.genderFilter === "male"}
                    onChange={() => handleGenderChange("male")}
                  />
                  <span
                    className="color-indicator"
                    style={{ backgroundColor: COLORS.male }}
                  />
                  <span>
                    Männlich <span className="count">({stats.male})</span>
                  </span>
                </label>
              </div>
            </section>
          ) : (
            <section className="legend-section">
              <h3>Epoche</h3>
              <div className="legend-options">
                <label className="legend-option">
                  <input
                    type="radio"
                    name="era"
                    checked={filters.eraFilter === "all"}
                    onChange={() => handleEraChange("all")}
                  />
                  <span>Alle</span>
                </label>
                {sortedEras.map(({ key, label, count, color }) => (
                  <label key={key} className="legend-option">
                    <input
                      type="radio"
                      name="era"
                      checked={filters.eraFilter === key}
                      onChange={() => handleEraChange(key)}
                    />
                    <span
                      className="color-indicator"
                      style={{ backgroundColor: color }}
                    />
                    <span>
                      {label} <span className="count">({count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <section className="legend-section">
            <h3>Kategorie</h3>
            <div className="legend-options">
              <label className="legend-option">
                <input
                  type="radio"
                  name="category"
                  checked={filters.categoryFilter === "all"}
                  onChange={() => handleCategoryChange("all")}
                />
                <span>Alle</span>
              </label>
              {sortedCategories.map(({ key, label, count }) => (
                <label
                  key={key}
                  className={`legend-option${count === 0 ? " disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="category"
                    checked={filters.categoryFilter === key}
                    onChange={() => handleCategoryChange(key)}
                    disabled={count === 0}
                  />
                  <span>
                    {label} <span className="count">({count})</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="legend-section">
            <label className="legend-option">
              <input
                type="checkbox"
                checked={filters.showAllStreets}
                onChange={(e) => handleShowAllChange(e.target.checked)}
              />
              <span>Alle Straßen anzeigen</span>
            </label>
            <button className="about-button" onClick={onAboutClick}>
              Über das Projekt
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
