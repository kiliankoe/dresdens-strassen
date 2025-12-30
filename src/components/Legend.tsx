import { useState } from "react";
import type { FilterState, StreetCategory } from "../lib/types";
import { CATEGORY_LABELS, COLORS } from "../lib/types";

interface LegendProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  stats: {
    total: number;
    namedAfterPerson: number;
    female: number;
    male: number;
  };
  onAboutClick: () => void;
}

export function Legend({
  filters,
  onFilterChange,
  stats,
  onAboutClick,
}: LegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleGenderChange = (gender: "all" | "female" | "male") => {
    onFilterChange({ ...filters, genderFilter: gender });
  };

  const handleCategoryChange = (category: StreetCategory | "all") => {
    onFilterChange({ ...filters, categoryFilter: category });
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
                <span>Weiblich ({stats.female})</span>
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
                <span>Männlich ({stats.male})</span>
              </label>
            </div>
          </section>

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
                <span>Alle Kategorien</span>
              </label>
              {(
                Object.entries(CATEGORY_LABELS) as [StreetCategory, string][]
              ).map(([key, label]) => (
                <label key={key} className="legend-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.categoryFilter === key}
                    onChange={() => handleCategoryChange(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="legend-section stats">
            <h3>Statistik</h3>
            <p>Straßen gesamt: {stats.total}</p>
            <p>Nach Personen benannt: {stats.namedAfterPerson}</p>
            <label className="legend-option" style={{ marginTop: "0.5rem" }}>
              <input
                type="checkbox"
                checked={filters.showAllStreets}
                onChange={(e) => handleShowAllChange(e.target.checked)}
              />
              <span>Alle Straßen anzeigen</span>
            </label>
          </section>

          <section className="legend-section">
            <button className="about-button" onClick={onAboutClick}>
              Über das Projekt
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
