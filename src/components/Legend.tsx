import { useMemo, useState } from "react";
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
  categoryCounts: Record<StreetCategory, number>;
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
        // "Andere" always at bottom
        if (a.key === "andere" && b.key !== "andere") return 1;
        if (b.key === "andere" && a.key !== "andere") return -1;
        // Zero counts next-to-last
        if (a.count === 0 && b.count > 0) return 1;
        if (b.count === 0 && a.count > 0) return -1;
        return b.count - a.count;
      });
  }, [categoryCounts]);

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
                <span>Weiblich <span className="count">({stats.female})</span></span>
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
                <span>Männlich <span className="count">({stats.male})</span></span>
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

          <section className="legend-section stats">
            <h3>Statistik</h3>
            <p>{stats.total} Straßen insgesamt</p>
            <p>{stats.namedAfterPerson} nach Personen benannt</p>
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
