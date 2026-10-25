# Würfelwerk

Ein lokal spielbarer D&D-Spieltisch mit deutscher Oberfläche. React, TypeScript und Vite.

## Lokal starten

Voraussetzung: Node.js 24 LTS und npm.

```powershell
cd C:\dev\dnd-spieltisch
npm.cmd ci
npm.cmd run dev
```

Öffne http://127.0.0.1:5173. Der Server lauscht nur auf diesem Gerät. Falls der Port bereits belegt ist, den betreffenden Prozess beenden oder den Port in vite.config.ts ändern.

## Bereits benutzbar

- Übersicht mit eigener Beispielkampagne, drei Helden und drei Höhlengoblins.
- Charaktere anlegen/bearbeiten: Attribute, Übung in Fertigkeiten, RK, Bewegung, TP, temporäre TP und Notizen.
- Attribute und Fertigkeiten direkt würfeln.
- W4 bis W100, freie Formeln wie 2d6+3, Vorteil/Nachteil für W20, geheimer SL-Wurf und Ergebnisverlauf.
- Inventar je Charakter: Suche, Kategorien, eigene Items, Mengen, Ausrüsten, Gewicht und Gold.
- Kampf: Initiative, Runden, aktiver Zug, eigene Monster, Schaden/Heilung, Zustände und Ereignisverlauf.
- Trefferpunkte zwischen Kampf und Charakterbogen synchronisiert.
- Letzte 30 Änderungen während der aktuellen Browser-Sitzung rückgängig machen.
- Rasterkarte mit eigenen SVG-Beispielgrafiken, Bildimport (PNG/JPEG/WebP bis 2 MB) und Figuren. Figur auswählen, dann Zielfeld anklicken; alternativ Pfeiltasten.
- Kampagnenname, Kapitel, Sitzung, Begegnungsname und SL-Notizen bearbeiten.
- Automatisches lokales Speichern, JSON-Export und validierter Import mit Vorschau.

## Datenspeicherung und Rollen

Alle Daten liegen im localStorage dieses Browsers unter wuerfelwerk.campaign.v1. Keine Anmeldung, kein Backend, keine Live-Synchronisierung. Browserdaten löschen oder ein anderer Browser/Host/Port ergibt einen anderen Spielstand. Regelmäßig als JSON exportieren.

Rückgängig ist auf 30 Schritte begrenzt und wird nicht über Neuladen hinweg gespeichert. Importe überschreiben erst nach Bestätigung den aktuellen Stand; sie sind ebenfalls rückgängig machbar. Importdateien sind auf 16 MB begrenzt.

Die Rollenumschaltung ist eine lokale Bedienvorschau. Sie blendet SL-Funktionen und geheime Würfe in der Spieleransicht aus, bietet aber keine Sicherheitsgrenze. Spielerdaten liegen weiterhin im gleichen Browser. Ein Wechsel des eigenen Charakters simuliert verschiedene Spieler.

Nur einen Tab je Spielstand bearbeiten: Gleichzeitige Bearbeitung in mehreren Tabs oder Geräten wird in dieser Version nicht zusammengeführt. Würfelergebnisse werden lokal über Web Crypto erzeugt und sind in der Online-Etappe serverseitig zu erzeugen/validieren.

## Noch geplant

Anmeldung und serverseitige Berechtigungen, gemeinsame Live-Runden, mehrere eigene Begegnungen und Karten, verborgene Kartenbereiche, Entfernungsmessung, Zauber/Ressourcen, Rettungswürfe, Todesrettungswürfe, Rasten und Levelaufstieg. Zustände sind aktuell Markierungen; Dauer und Regelwirkungen werden manuell verwaltet. Ausrüsten verändert die RK nicht automatisch. Regelbasis und Automatisierungsgrad sind noch festzulegen.

Den vollständigen Entwicklungsplan findest du in [PLAN.md](PLAN.md).

## Prüfen und bauen

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Die Tests prüfen Würfelformeln und Grenzen, Vorteil/Nachteil, TP-Regeln und Synchronisation, Initiative, Runden und Importvalidierung. Build führt zusätzlich die TypeScript-Prüfung aus. Die statische Ausgabe entsteht in dist/.

## GitHub und GitHub Pages

- Quellcode: https://github.com/AlexSeiff/dnd-spieltisch
- Online spielen: https://alexseiff.github.io/dnd-spieltisch/

1. Jeder Push auf main startet .github/workflows/pages.yml: testen, bauen und dist/ auf GitHub Pages veröffentlichen.
2. Pages ist unter Settings → Pages auf **GitHub Actions** eingestellt.
3. Die Online-Version speichert ihren Spielstand getrennt von localhost im jeweiligen Browser.
4. Pull Requests laufen durch .github/workflows/ci.yml; sie veröffentlichen nichts.

Vite verwendet relative Assetpfade (base: './'). Die App benötigt keine Server-Routen; Pages-Unterverzeichnisse funktionieren. Workflow basiert auf der [offiziellen Vite-Anleitung](https://vite.dev/guide/static-deploy.html#github-pages). Live-Runden brauchen zusätzlich ein Backend.

## Projektstruktur

- src/domain/: Datenmodell, Würfel-/Kampflogik, Speicherung und Beispieldaten.
- src/hooks/: Zustandsverwaltung, automatisches Speichern und Undo.
- src/components/: gemeinsame UI und Rasterkarte.
- src/views/: Übersicht, Charakterbogen, Würfelraum, Inventar und Kampf.
- tests/: Domänentests mit dem eingebauten Node-Test-Runner.
- PLAN.md: Produktplan und weitere Etappen.

## Inhalte und Lizenzen

Kampagne, Charaktere, Gegenstandsbeschreibungen und Kartenillustration sind eigene Beispieldaten. Keine offiziellen Logos, Regelbuchtexte oder gekauften Karten enthalten. Fremdinhalte erst nach Prüfung der jeweiligen Lizenz ergänzen. Bibliothekslizenzen stehen in den installierten Paketen; Lucide-Symbole unter ISC. Der eigene Anwendungscode steht unter der [MIT-Lizenz](LICENSE).

## Neue Gestaltung und Karten

- Räumlich gerenderte W4, W6, W8, W10, W12 und W20 rollen mit Drehung, Sprüngen und Schatten über einen Würfelteller. Das Ergebnis wird erst danach angezeigt und gespeichert.
- W100 erscheinen als zwei W10 für Zehner und Einer; 00 + 0 bedeutet 100. Bei großen Würfen werden bis zu sechs Ergebnisse räumlich dargestellt; alle Ergebnisse gehen in die Summe und den Verlauf ein. Freie andere Seitenzahlen nutzen einen beschrifteten Polyeder.
- Auch Würfe aus dem Charakterbogen erhalten eine kleine Würfelanimation. Die Systempräferenz für reduzierte Bewegung wird berücksichtigt.
- Charakterbögen sind als Pergamentrollen mit Holzstäben und Tintenschrift gestaltet.
- Sitzungsnotizen und Charakternotizen verwenden ein Papier-/Notizbuchdesign. Die Handschrift Caveat liegt lokal in public/fonts; die SIL-OFL-Lizenz liegt daneben. Quelle: https://github.com/google/fonts/tree/main/ofl/caveat.
- Der Atlas enthält Weltkarte, Stadtplan, Dungeon und Kampfkarte. Markierte Orte zeigen Beschreibungen; einige führen direkt zur passenden anderen Karte.
- Welt-/Stadt-/Dungeon-Karten lassen sich bis 250 % vergrößern und mit Maus oder Scrollen verschieben. Ein optionales Raster unterstützt die Orientierung.
- Eigene Bilder können die drei Atlaskarten ersetzen (PNG/JPEG/WebP bis 8 MB, lokal auf maximal 2000 Pixel und eine kleinere JPEG-Datei umgerechnet). Beispielmarkierungen werden dabei ausgeblendet; mit Zurücksetzen kommt die Beispielkarte zurück. Die Kampfkarte verwendet weiterhin ihren bisherigen separaten Bildimport bis 2 MB.
- Kartenauswahl und eigene Bilder werden gespeichert und exportiert. Alte Spielstände ohne Atlas bleiben kompatibel; das JSON-Importlimit beträgt jetzt 16 MB. Die verfügbare Kapazität des Browser-Speichers kann früher erreicht sein; Speicherfehler bleiben sichtbar, ein Export ist weiterhin möglich.

Die Karten sind selbst erstellte schematische Beispiele. Eine vollständige Kartenbearbeitung, eigene Ortsmarkierungen, Entfernungsmessung und Sichtfreigabe sind weitere Ausbauschritte.
