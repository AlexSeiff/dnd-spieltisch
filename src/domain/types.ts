export type View =
  | "overview"
  | "characters"
  | "dice"
  | "inventory"
  | "combat"
  | "map"
  | "journal";
export type Role = "gm" | "player";
export type StatKey =
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma";
export type Stats = Record<StatKey, number>;
export type Color = "sage" | "amber" | "violet" | "red";
export interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  weight: number;
  equipped: boolean;
  description: string;
}
export interface Character {
  id: string;
  name: string;
  ancestry: string;
  className: string;
  level: number;
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  speed: number;
  gold: number;
  stats: Stats;
  proficiencies: string[];
  inventory: Item[];
  notes: string;
  color: Color;
}
export interface Combatant {
  id: string;
  characterId?: string;
  name: string;
  kind: "hero" | "monster";
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  initiative: number;
  dexterity: number;
  conditions: string[];
  x: number;
  y: number;
  color: Color;
}
export interface Combat {
  name: string;
  round: number;
  activeId: string | null;
  started: boolean;
  participants: Combatant[];
  events: { id: string; text: string; time: string }[];
}
export interface DiceResult {
  id: string;
  formula: string;
  rolls: number[];
  total: number;
  modifier: number;
  mode: "normal" | "advantage" | "disadvantage";
  sides: number;
  label: string;
  secret: boolean;
  time: string;
}
export type MapId = "world" | "city" | "dungeon" | "bridge";
export const MAP_IDS: MapId[] = ["world", "city", "dungeon", "bridge"];
export interface CampaignState {
  schemaVersion: 1;
  campaign: { name: string; chapter: string; session: number; notes: string };
  characters: Character[];
  combat: Combat;
  rolls: DiceResult[];
  map: { image: string | null; grid: boolean };
  atlas?: { activeMapId: MapId; images: Partial<Record<MapId, string>> };
}
export const STATS: { key: StatKey; label: string; short: string }[] = [
  { key: "strength", label: "Stärke", short: "STÄ" },
  { key: "dexterity", label: "Geschicklichkeit", short: "GES" },
  { key: "constitution", label: "Konstitution", short: "KON" },
  { key: "intelligence", label: "Intelligenz", short: "INT" },
  { key: "wisdom", label: "Weisheit", short: "WEI" },
  { key: "charisma", label: "Charisma", short: "CHA" },
];
export const SKILLS: { name: string; stat: StatKey }[] = [
  { name: "Akrobatik", stat: "dexterity" },
  { name: "Arkane Kunde", stat: "intelligence" },
  { name: "Athletik", stat: "strength" },
  { name: "Auftreten", stat: "charisma" },
  { name: "Einschüchtern", stat: "charisma" },
  { name: "Fingerfertigkeit", stat: "dexterity" },
  { name: "Geschichte", stat: "intelligence" },
  { name: "Heilkunde", stat: "wisdom" },
  { name: "Heimlichkeit", stat: "dexterity" },
  { name: "Mit Tieren umgehen", stat: "wisdom" },
  { name: "Motiv erkennen", stat: "wisdom" },
  { name: "Nachforschungen", stat: "intelligence" },
  { name: "Naturkunde", stat: "intelligence" },
  { name: "Religion", stat: "intelligence" },
  { name: "Täuschen", stat: "charisma" },
  { name: "Überlebenskunst", stat: "wisdom" },
  { name: "Überzeugen", stat: "charisma" },
  { name: "Wahrnehmung", stat: "wisdom" },
];
export const CONDITIONS = [
  "Blind",
  "Bezaubert",
  "Betäubt",
  "Bewusstlos",
  "Festgesetzt",
  "Gepackt",
  "Gelähmt",
  "Liegend",
  "Taub",
  "Unsichtbar",
  "Vergiftet",
  "Verängstigt",
  "Versteinert",
  "Konzentration",
];
