# Dresdens Straßen

Visualisierung und Analyse von Straßendaten in Dresden, basierend auf Daten aus dem [OpenData-Portal](https://opendata.dresden.de) der Stadt Dresden.

Die Daten in diesem Repo werden wöchentlich per GitHub Action aus dem WFS der Stadt aktualisiert. Damit hier wirklich nur Änderungen an den Straßendaten getracked werden, werden noch sich öfter ändernde Metadaten (`fme_transfer_date` und `id`) entfernt, siehe `scripts/format-streets.ts`.
