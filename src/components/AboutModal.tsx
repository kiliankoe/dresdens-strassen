interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
          Dies ist ein Projekt von <a href="https://kilian.io">Kilian</a>. Ich
          war neugierig, wie viele von Dresdens Straßen nach Frauen benannt
          waren. Anscheinend ~12%.
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
          <a href="https://openfreemap.org/">OpenFreeMap</a> gehostet,
          dankeschön! 🫶
        </p>

        <p>
          Quelltext der Seite liegt auf{" "}
          <a href="https://github.com/kiliankoe/dresdens-strassen">GitHub</a>.
        </p>
      </div>
    </div>
  );
}
