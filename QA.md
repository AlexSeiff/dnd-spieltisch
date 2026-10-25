# Prüfstand – Würfelwerk 0.1

Datum: 25. Oktober 2026.

## Automatisch

- 12 Domänentests erfolgreich: Attributs- und Übungsboni, Würfelformeln und Grenzen, Vorteil/Nachteil, temporäre TP, Heilung, Charakter-/Kampf-Synchronisierung, Initiative und Runden sowie JSON-Importvalidierung.
- TypeScript-Prüfung und Vite-Produktionsbuild erfolgreich.
- Installierte Produktions-/Entwicklungsabhängigkeiten: npm meldet keine bekannten Schwachstellen zum Prüfzeitpunkt.

## Im eingebetteten Browser geprüft

- Ungültige Formel zeigt eine Fehlermeldung; 2d6+3 liefert eine nachvollziehbare Summe.
- Vorteil verwendet zwei W20 und den höheren Wert.
- Neuer Charakter mit geübter Fertigkeit wird angelegt und erscheint im Bogen.
- Kampfstart markiert den ersten Teilnehmer.
- Drei temporäre TP und fünf Schaden ergeben zwei verlorene reguläre TP.
- Schaden erscheint konsistent im Charakterbogen.
- Zustand hinzufügen und über Rückgängig entfernen.
- Inventarmenge ändern, Suchfilter verwenden und eigenen Gegenstand anlegen.
- Kartenfigur per Pfeiltaste um ein Feld bewegen.
- Neuladen erhält Trefferpunkte, Kampfstatus und Würfelverlauf.
- JSON-Import zeigt zunächst eine Vorschau und stellt nach Bestätigung den Beispielstand wieder her.
- JSON-Export wird heruntergeladen; die tatsächliche Datei wird mit derselben Importvalidierung erfolgreich gelesen.
- Spieleransicht blendet geheime SL-Würfe, SL-Export/Import und die SL-Würfeloption aus. Beim Rollenwechsel verschwindet auch der letzte Hinweis.
- Zugänglicher Name für die als Symbol angezeigte Exporttaste ergänzt.

## Übergabestand

Die während der Browserprüfung angelegten Daten wurden durch Import des Beispielstands und Rückgängig der Testwürfe bereinigt. Projekt enthält eine lokale Git-Initialisierung auf main, keinen Remote und keinen Commit. GitHub-Workflows sind vorbereitet, aber noch nicht auf GitHub ausgeführt.

## Grenzen der Prüfung

Browserprüfung im schmalen Codex-Vorschaufenster; keine separate Geräte-/Browsermatrix. Eigener Kartenbildupload und ein reales GitHub-Pages-Deployment wurden nicht im Browser getestet. Kein Backend oder Mehrspielerbetrieb implementiert. Rollen sind eine lokale UI-Vorschau und keine Zugriffskontrolle. Weitere Etappen stehen in PLAN.md.

## Ergänzung: räumliche Würfel, Papiergestaltung und Atlas

- Aktueller Stand: 23 automatisierte Tests erfolgreich; TypeScript und Produktionsbuild erfolgreich.
- Zusätzlich geprüft: Flächenanzahl und geschlossene Geometrie aller Standardwürfel, Ergebnisfläche für jeden möglichen Standardwurf, alle 100 Prozentwurfergebnisse, Begrenzung großer Darstellungen, alte Spielstände ohne Atlas, Atlas-Export/-Import und gültige Kartenverknüpfungen.
- Im Browser geprüft: laufende Animation mit gesperrten Würfeltasten und noch verborgenem Ergebnis, anschließende Anzeige/Speicherung, W100 als 30 + 4 = 34, Pergamentbogen, lokal geladene Handschrift, Ortsauswahl, Weltkarte → Dungeon, Kartenwechsel und Zoom.
- Visuelle Prüfung in schmaler Vorschau und Desktopansicht. Eigene Kartenbilder verwenden den neuen verkleinernden Import; dieser Upload wurde noch nicht im Browser durchgespielt.
- Die Schrift wird aus dem Build lokal geladen; der erzeugte relative CSS-Pfad und die ausgelieferte Fontdatei wurden geprüft.
- Bestehende Nutzerdaten wurden nicht zurückgesetzt. Testwürfe erscheinen im normalen lokalen Verlauf.
