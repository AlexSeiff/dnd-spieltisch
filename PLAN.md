# Würfelwerk – digitaler D&D-Spieltisch

Stand: 25. Oktober 2026. Responsive Webanwendung für Laptop, Tablet und Smartphone; Quellcode auf GitHub, statische Oberfläche über GitHub Pages.

## Ziel

Spielleiter und Spieler verwalten ihre Sitzung mit wenigen Klicks: Charakterwerte, Würfel, Inventar, Initiative, Trefferpunkte, Zustände und Karten. Weniger Nachschlagen und Kopfrechnen, mehr Zeit für das Abenteuer. Hausregeln bleiben möglich.

Vorläufige Regelbasis: D&D 5e. Regelfassung (2014/2024) und gewünschte Automatisierung vor dem weiteren Ausbau abstimmen. Der Prototyp verwendet allgemeine Mechaniken und eigene Beispielinhalte; kein vollständiger Regelkatalog und keine Übernahme lizenzpflichtiger Buchinhalte.

## Rollen

### Spieleransicht

- Charakterbogen: Attribute, Boni, Rettungswürfe, Fertigkeiten, Rüstungsklasse, Bewegung, Trefferpunkte und Ressourcen.
- Würfe direkt aus dem Bogen, Vorteil/Nachteil und verständlicher Verlauf.
- Inventar, Ausrüstung, Gewicht, Gold und eigene Items.
- Freigegebene Karte, eigene Figur und gemeinsame Notizen.

### Spielleiteransicht

- Kampagne, Gruppe, Sitzungsnotizen und vorbereitete Begegnungen.
- Monster/NSCs mit eigenen Werten, Angriffen und Zuständen.
- Kampf: Initiative, aktiver Zug, Runden, Schaden/Heilung und Ereignisverlauf.
- Karten, Figuren und später verborgene Bereiche.
- Geheime Informationen und Beuteverteilung.

Die lokale Rollenumschaltung ist eine Bedienvorschau, keine Zugriffskontrolle. Schutz vertraulicher SL-Daten erfordert serverseitige Rollen und gefilterte Abfragen in der Online-Etappe.

## Funktionsbereiche

| Bereich        | Geplante Funktionen                                                                           |
| -------------- | --------------------------------------------------------------------------------------------- |
| Würfel         | W4–W100, Formeln wie 2d6+3, Vorteil/Nachteil bei W20, öffentliche/geheime Würfe, Verlauf      |
| Charakterbogen | Automatische Boni, manuell bearbeitbare Werte, Übungsbonus, Angriffe, Zauber und Ressourcen   |
| Gegenstände    | Suchbare Liste, eigene Items, Ausrüstung, Mengen, Gewicht, Verbrauch, Übergaben               |
| Kampf          | Initiative, aktiver Zug, Runden, Schaden/Heilung, temporäre TP, Zustände, Rückgängig, Verlauf |
| Karten         | Bildimport, Raster und Figuren; Zoom; später Entfernungsmessung und Sichtfreigabe             |
| Kampagne       | Mitglieder, Charaktere, Begegnungen, Notizen und gespeicherter Spielstand                     |

## Kampfablauf

1. Begegnung vorbereiten und Gruppe hinzufügen.
2. Initiative würfeln, Gegner einzeln oder später als Gruppe.
3. Reihenfolge sortieren und aktiven Zug markieren.
4. Angriffe und Schaden aus den Werten würfeln.
5. Schaden/Effekte bestätigen, Trefferpunkte anpassen.
6. Zustände mit Dauer sichtbar halten.
7. Nächster Zug; beim Umlauf Rundenzähler erhöhen.
8. Ressourcen und Verlauf nach dem Kampf speichern.

Fehler müssen rückgängig gemacht werden können. Ausgeschaltete Monster werden übersprungen; Charaktere bei 0 TP behalten ihren Zug für spätere Todesrettungswürfe.

## Oberfläche

- Desktop: Navigation links, Arbeitsfläche in der Mitte, kontextbezogene Gruppe/Verlauf daneben.
- Mobil: kompakte Navigation, einspaltige Inhalte, große Aktionsflächen.
- Direkte Aktionen für Würfe, Trefferpunkte und Zugwechsel.
- Dunkle, ruhige Oberfläche mit salbeigrünen Akzenten, gut lesbaren Zahlen und klaren Statusanzeigen.

## Technik und GitHub

- React und TypeScript mit Vite; responsives CSS und Lucide-Symbole.
- Fachlogik getrennt von UI-Komponenten, versioniertes Datenmodell.
- Etappe 1: lokaler Browser-Speicher und validierter JSON-Import/-Export.
- GitHub Actions: Tests, TypeScript-Prüfung, Build, Pages-Deployment.
- Relative Assets für GitHub-Pages-Unterverzeichnisse, kein Server-Routing nötig.
- Online-Etappe: Backend für Anmeldung, Datenbank, Echtzeitverbindung und Dateispeicher; Anbieter nach Budget, Datenschutz und Betriebsaufwand auswählen.

GitHub Pages liefert statische Dateien aus. Gemeinsame Live-Runden und geschützte SL-Daten benötigen zusätzlich ein Backend. Keine Servergeheimnisse in Frontend oder Repository speichern.

## Etappe 1 – spielbarer lokaler Prototyp

1. Navigation, Übersicht und eigene Beispieldaten.
2. Charaktere anlegen/bearbeiten, Attribute und Fertigkeiten würfeln.
3. Würfelraum mit Formeln, Vorteil/Nachteil und Verlauf.
4. Inventar je Charakter, eigene Gegenstände, Ausrüstung und Gold.
5. Kampf mit Initiative, Trefferpunkten, Zuständen und Rückgängig.
6. Einfache Rasterkarte mit Figuren und Bildimport.
7. Automatisches Speichern und JSON-Sicherungen.

**Abnahme:** Mindestens zwei Charaktere und drei Monster in einer Begegnung verwalten, Initiative würfeln, Züge wechseln, Schaden/Zustände ändern, Änderungen rückgängig machen, Browser neu laden und den Spielstand fortsetzen. Export und Import stellen den Stand wieder her.

## Etappe 2 – gemeinsame Online-Runde

- Anmeldung, Einladungen und Kampagnenmitgliedschaften.
- Serverseitige Rollen und Eigentumsberechtigungen.
- Synchronisierte Charakterwerte, Würfel und Kampfereignisse.
- Serverseitige Würfe, Konfliktbehandlung, Wiederverbindung und Backups.
- Geheime Daten getrennt speichern und nur berechtigte Informationen ausliefern.

## Etappe 3 – Karten und Vorbereitung

- Mehrere Karten/Begegnungen, dauerhafte Uploads und Figurenbibliothek.
- Drag-and-drop, Rastergröße, Zoom und Entfernungsmessung.
- Verborgene Gegner und manuelle Sichtfreigabe.
- Begegnungen wiederverwenden und Beute verteilen.

## Etappe 4 – Komfort

- Zauber, Fähigkeiten und begrenzte Ressourcen.
- Todesrettungswürfe, kurze/lange Rast, vollständige Charaktererstellung.
- Levelaufstieg, Hausregeln, Inhaltsbibliotheken und Sitzungsjournal.
- Offline-Unterstützung und weitere mobile Optimierungen.

## Qualitätsziele

- Temporäre TP vor normalen TP verbrauchen; Heilung aufs Maximum begrenzen.
- Stabile Initiative, konsistenter Rundenzähler und rückgängig machbare Kampfaktionen.
- Begrenzte Würfelformeln ohne eval, Zufall über Browser-Kryptografie.
- Ungültige Importe verändern keinen Spielstand; Speicherfehler sichtbar melden.
- Tastaturbedienung, beschriftete Felder, sichtbarer Fokus und mobile Layouts.
- Fachlogik automatisch testen, vollständige Abläufe im Browser prüfen.

## Bewusst später

Dynamische Beleuchtung, vollständige Regelautomatisierung und umfassender Regelkatalog. Der Prototyp verspricht keine Anmeldung oder Live-Synchronisierung.

## Offene Entscheidungen

- D&D 5e 2014 oder 2024, Umfang der Hausregeln.
- Präsenzrunde oder überwiegend Fernspiel.
- Hostingbudget, Backend und gewünschte Inhalte/Lizenzen.

## Technische Referenzen

- [Vite: Einstieg](https://vite.dev/guide/)
- [Vite: statisches Hosting und GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages)

## Umgesetzt: Gestaltung und Atlas

Die ursprünglich später geplanten räumlichen Würfel sind jetzt als Canvas-Darstellung mit korrespondierenden Ergebnisflächen vorhanden. Charakterbögen verwenden eine Pergamentgestaltung; SL- und Charakternotizen eine lokal verfügbare Handschrift und Papiergestaltung.

Der Atlas ergänzt Weltkarte, Stadtplan und Dungeon zur bestehenden Kampfkarte. Ortsbeschreibungen, Querverknüpfungen, Zoom, Mausverschiebung, optionales Raster und eigene Kartenbilder sind vorhanden. Kartenauswahl und Bilder werden im abwärtskompatibel ergänzten Datenmodell exportiert. Frei platzierbare eigene Orte, mehrere eigene Karten je Kategorie, Begegnungen auf beliebigen Karten und Sichtfreigabe bleiben weitere Etappen.
