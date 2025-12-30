import type { StreetProperties } from "../lib/types";
import { CATEGORY_LABELS, COLORS } from "../lib/types";

interface InfoPanelProps {
  street: StreetProperties | null;
  onClose: () => void;
}

export function InfoPanel({ street, onClose }: InfoPanelProps) {
  if (!street) return null;

  const genderColor =
    street.isFemale === true
      ? COLORS.female
      : street.isFemale === false
        ? COLORS.male
        : COLORS.neutral;

  const genderLabel =
    street.isFemale === true
      ? "Weiblich"
      : street.isFemale === false
        ? "Männlich"
        : null;

  return (
    <div className="info-panel">
      <button
        className="info-panel-close"
        onClick={onClose}
        aria-label="Schließen"
      >
        ×
      </button>

      <h2 className="info-panel-title">{street.name}</h2>
      {street.nameShort !== street.name && (
        <p className="info-panel-subtitle">{street.nameShort}</p>
      )}

      {street.person && (
        <div className="info-panel-person">
          <h3>{street.person}</h3>

          {street.description && (
            <p className="info-panel-description">{street.description}</p>
          )}

          <div className="info-panel-meta">
            {(street.birthYear || street.deathYear) && (
              <span className="info-panel-years">
                {street.birthYear && `* ${street.birthYear}`}
                {street.birthYear && street.deathYear && " – "}
                {street.deathYear && `† ${street.deathYear}`}
              </span>
            )}

            {genderLabel && (
              <span
                className="info-panel-gender"
                style={{ backgroundColor: genderColor }}
              >
                {genderLabel}
              </span>
            )}

            {street.category && (
              <span className="info-panel-category">
                {CATEGORY_LABELS[street.category]}
              </span>
            )}
          </div>
        </div>
      )}

      {!street.person && (
        <p className="info-panel-no-person">
          Diese Straße ist nicht nach einer Person benannt.
        </p>
      )}
    </div>
  );
}
