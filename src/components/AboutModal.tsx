interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    total: number;
    namedAfterPerson: number;
    female: number;
    male: number;
  };
  lastUpdated: string | null;
}

export function AboutModal({
  isOpen,
  onClose,
  stats,
  lastUpdated,
}: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Schließen"
        >
          ×
        </button>

        <h1>Über das Projekt</h1>

        <p>
          Das hier ist ein Projekt von <a href="https://kilian.io">Kilian</a>.
          Ich war neugierig, wie viele von Dresdens Straßen nach Frauen benannt
          sind, anscheinend so ~12%.
        </p>

        <p>
          Diese Visualisierung basiert auf Daten aus dem{" "}
          <a href="https://opendata.dresden.de">OpenData-Portal</a> der Stadt
          Dresden, spezifisch dem Datensatz{" "}
          <a href="https://opendata.dresden.de/informationsportal/?open=1&result=88648FB445034F0A8A87C852EE858E8D#app/mainpage////">
            Straßenknotennetz 1:25000 (SKN25) - Straßenzüge
          </a>
          .
        </p>

        <p>
          Kartendaten werden freundlicherweise von{" "}
          <a href="https://openfreemap.org/">OpenFreeMap</a> bereitgestellt,
          dankeschön! 🫶
        </p>

        <p>
          Der Quelltext der Seite liegt auf{" "}
          <a href="https://github.com/kiliankoe/dresdens-strassen">GitHub</a>.
        </p>

        <div className="modal-stats">
          <p>{stats.total} Straßen insgesamt</p>
          <p>{stats.namedAfterPerson} nach Personen benannt</p>
          <p>
            {stats.female} weiblich, {stats.male} männlich
          </p>
          <br />
          {lastUpdated && (
            <p>
              Stand:{" "}
              {new Date(lastUpdated).toLocaleDateString("de-DE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
