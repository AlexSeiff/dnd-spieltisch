import type { MapId } from "./types.ts";
export interface MapPlace {
  id: string;
  name: string;
  kind: string;
  x: number;
  y: number;
  description: string;
  destination?: MapId;
}
export interface AtlasMap {
  id: MapId;
  title: string;
  category: string;
  subtitle: string;
  scale: string;
  places: MapPlace[];
}
export const ATLAS_MAPS: AtlasMap[] = [
  {
    id: "world",
    title: "Die Grenzlande",
    category: "Weltkarte",
    subtitle: "Küsten, Gebirge und vergessene Pfade",
    scale: "50 km",
    places: [
      {
        id: "eldermoor",
        name: "Eldermoor",
        kind: "Stadt",
        x: 49,
        y: 57,
        description:
          "Eine alte Handelsstadt am Grauwasser. Zwischen ihren Gassen beginnen die Wege in die nördlichen Grenzlande.",
        destination: "city",
      },
      {
        id: "wacht",
        name: "Die vergessene Wacht",
        kind: "Ruine",
        x: 62,
        y: 33,
        description:
          "Über dem Nesselwald liegt die verlassene Festung. Unter ihrem Turm führen Stufen in eine versiegelte Krypta.",
        destination: "dungeon",
      },
      {
        id: "bridge",
        name: "Die alte Brücke",
        kind: "Begegnung",
        x: 55,
        y: 47,
        description:
          "Die steinerne Brücke ist der letzte Übergang vor den Ruinen. Hier wartet die vorbereitete Begegnung.",
        destination: "bridge",
      },
      {
        id: "veyr",
        name: "Veyr",
        kind: "Hafen",
        x: 29,
        y: 71,
        description:
          "Salzige Luft, fremde Segel und Gerüchte aus allen Teilen der Küste. Von hier fahren Schiffe zu den Splitterinseln.",
      },
      {
        id: "glasgrat",
        name: "Der Glasgrat",
        kind: "Gebirge",
        x: 43,
        y: 23,
        description:
          "Schmale Pässe durchziehen die scharfkantigen Gipfel. Alte Minen und der erste Schnee liegen weit über den Handelswegen.",
      },
    ],
  },
  {
    id: "city",
    title: "Eldermoor",
    category: "Stadtplan",
    subtitle: "Gassen, Gasthäuser und Geschichten",
    scale: "100 m",
    places: [
      {
        id: "market",
        name: "Der alte Markt",
        kind: "Marktplatz",
        x: 48,
        y: 49,
        description:
          "Unter bunten Markisen wechseln Vorräte, Werkzeuge und seltene Fundstücke die Besitzer. Ein guter Ort für neue Aufträge.",
      },
      {
        id: "inn",
        name: "Zum schlafenden Drachen",
        kind: "Gasthaus",
        x: 33,
        y: 41,
        description:
          "Warmes Essen, ein freies Zimmer und eine Wirtin, die mehr weiß, als sie verrät. Die Gruppe kann hier ihre nächste Reise vorbereiten.",
      },
      {
        id: "harbour",
        name: "Die Flusspiere",
        kind: "Hafenviertel",
        x: 74,
        y: 62,
        description:
          "Lastkähne und kleine Fähren liegen am Grauwasser. Die Hafenarbeiter hören jeden Abend andere Geschichten.",
      },
      {
        id: "temple",
        name: "Der Morgenhof",
        kind: "Tempel",
        x: 51,
        y: 27,
        description:
          "Ein stiller Hof zwischen weißen Mauern. Reisende suchen hier Rat, Heilung und einen Augenblick Ruhe.",
      },
      {
        id: "gate",
        name: "Das Nordtor",
        kind: "Stadttor",
        x: 54,
        y: 13,
        description:
          "Hinter dem Tor führt die Straße zur alten Brücke und weiter zur Wacht.",
        destination: "world",
      },
    ],
  },
  {
    id: "dungeon",
    title: "Unter der alten Wacht",
    category: "Dungeon",
    subtitle: "Eine Krypta mit fünf erkundbaren Orten",
    scale: "3 m / Feld",
    places: [
      {
        id: "entry",
        name: "Die Treppe",
        kind: "Eingang",
        x: 18,
        y: 77,
        description:
          "Feuchte Stufen führen unter die Wacht. Die Luft riecht nach Staub und kaltem Stein.",
      },
      {
        id: "guard",
        name: "Die Wachstube",
        kind: "Raum",
        x: 24,
        y: 46,
        description:
          "Zerbrochene Möbel und ein umgestürzter Tisch. In den Ritzen des Mauerwerks liegen die Spuren ehemaliger Bewohner.",
      },
      {
        id: "archive",
        name: "Das verlorene Archiv",
        kind: "Raum",
        x: 52,
        y: 23,
        description:
          "Regale stehen an den Wänden. Zwischen beschädigten Schriftrollen könnte sich ein Hinweis auf den Fall der Wacht finden.",
      },
      {
        id: "crypt",
        name: "Die Krypta",
        kind: "Halle",
        x: 72,
        y: 50,
        description:
          "Vier steinerne Sarkophage säumen die Halle. Ein verblasstes Wappen ist über dem nördlichen Durchgang zu sehen.",
      },
      {
        id: "vault",
        name: "Die versiegelte Kammer",
        kind: "Kammer",
        x: 79,
        y: 80,
        description:
          "Die Tür trägt alte Runen. Was sich dahinter verbirgt, entscheidet der Spielleiter.",
      },
    ],
  },
  {
    id: "bridge",
    title: "Die alte Brücke",
    category: "Kampfkarte",
    subtitle: "Figuren, Raster und die laufende Begegnung",
    scale: "1,5 m / Feld",
    places: [],
  },
];
export const atlasMap = (id: MapId) => ATLAS_MAPS.find((m) => m.id === id)!;
