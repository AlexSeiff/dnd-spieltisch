import type { CampaignState } from "./types.ts";
import { initialState } from "./seed.ts";
import { MAP_IDS } from "./types.ts";

export const STORAGE_KEY = "wuerfelwerk.campaign.v1";
export const MAX_IMPORT_SIZE = 16_000_000;
type Obj = Record<string, unknown>;
const object = (x: unknown): x is Obj =>
  typeof x === "object" && x !== null && !Array.isArray(x);
const text = (x: unknown, max = 200) =>
  typeof x === "string" && x.length <= max;
const num = (x: unknown, min: number, max: number, integer = true) =>
  typeof x === "number" &&
  Number.isFinite(x) &&
  x >= min &&
  x <= max &&
  (!integer || Number.isInteger(x));
const list = (
  x: unknown,
  max: number,
  valid: (entry: unknown) => boolean,
): x is unknown[] => Array.isArray(x) && x.length <= max && x.every(valid);
const color = (x: unknown) =>
  ["sage", "amber", "violet", "red"].includes(x as string);
const id = (x: unknown) =>
  typeof x === "string" && x.length > 0 && x.length <= 100;
const unique = (xs: unknown[]) =>
  new Set(xs.map((x) => (x as Obj).id)).size === xs.length;
const hp = (x: Obj) =>
  num(x.maxHp, 1, 100000) &&
  num(x.hp, 0, x.maxHp as number) &&
  num(x.tempHp, 0, 100000);
const item = (x: unknown) =>
  object(x) &&
  id(x.id) &&
  text(x.name) &&
  text(x.category) &&
  num(x.quantity, 0, 10000) &&
  num(x.weight, 0, 10000, false) &&
  typeof x.equipped === "boolean" &&
  text(x.description, 5000);
const character = (x: unknown) =>
  object(x) &&
  id(x.id) &&
  text(x.name) &&
  text(x.ancestry) &&
  text(x.className) &&
  num(x.level, 1, 20) &&
  hp(x) &&
  num(x.ac, 0, 100) &&
  num(x.speed, 0, 1000, false) &&
  num(x.gold, 0, 1e9, false) &&
  color(x.color) &&
  text(x.notes, 20000) &&
  object(x.stats) &&
  [
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
  ].every((k) => num((x.stats as Obj)[k], 1, 30)) &&
  list(x.proficiencies, 30, (p) => text(p)) &&
  list(x.inventory, 300, item) &&
  unique(x.inventory);
const participant = (x: unknown) =>
  object(x) &&
  id(x.id) &&
  text(x.name) &&
  ["hero", "monster"].includes(x.kind as string) &&
  hp(x) &&
  num(x.ac, 0, 100) &&
  num(x.initiative, -100, 1000) &&
  num(x.dexterity, 1, 30) &&
  list(x.conditions, 30, (p) => text(p)) &&
  num(x.x, 0, 11) &&
  num(x.y, 0, 9) &&
  color(x.color) &&
  (x.characterId === undefined || id(x.characterId));
const time = (x: unknown) =>
  text(x, 50) && Number.isFinite(Date.parse(x as string));
const event = (x: unknown) =>
  object(x) && id(x.id) && text(x.text, 1000) && time(x.time);
const mapImage = (x: unknown) =>
  typeof x === "string" &&
  x.length <= 2_800_000 &&
  new RegExp("^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$").test(x);
const atlas = (x: unknown) =>
  x === undefined ||
  (object(x) &&
    MAP_IDS.includes(x.activeMapId as import("./types.ts").MapId) &&
    object(x.images) &&
    Object.keys(x.images).length <= 4 &&
    Object.entries(x.images).every(
      ([key, value]) =>
        MAP_IDS.includes(key as import("./types.ts").MapId) && mapImage(value),
    ));
const roll = (x: unknown) =>
  object(x) &&
  id(x.id) &&
  text(x.formula) &&
  list(x.rolls, 100, (r) => num(r, 1, 1000)) &&
  num(x.total, -10000, 110000) &&
  num(x.modifier, -10000, 10000) &&
  ["normal", "advantage", "disadvantage"].includes(x.mode as string) &&
  num(x.sides, 2, 1000) &&
  text(x.label) &&
  typeof x.secret === "boolean" &&
  time(x.time);

export function parseCampaign(raw: string): CampaignState {
  if (raw.length > MAX_IMPORT_SIZE)
    throw new Error("Die Datei ist zu groß. Maximal 16 MB sind erlaubt.");
  let x: unknown;
  try {
    x = JSON.parse(raw);
  } catch {
    throw new Error("Die Datei enthält kein gültiges JSON.");
  }
  if (!object(x) || x.schemaVersion !== 1)
    throw new Error(
      "Dieses Spielstandformat wird nicht unterstützt (erwartet: Version 1).",
    );
  const c = x.campaign,
    b = x.combat,
    m = x.map;
  const valid =
    object(c) &&
    text(c.name) &&
    text(c.chapter) &&
    num(c.session, 1, 9999) &&
    text(c.notes, 100000) &&
    list(x.characters, 100, character) &&
    unique(x.characters) &&
    object(b) &&
    text(b.name) &&
    num(b.round, 1, 100000) &&
    typeof b.started === "boolean" &&
    list(b.participants, 200, participant) &&
    unique(b.participants) &&
    (b.activeId === null ||
      (id(b.activeId) &&
        b.participants.some((p) => (p as Obj).id === b.activeId))) &&
    (!b.started || b.activeId !== null) &&
    list(b.events, 150, event) &&
    list(x.rolls, 100, roll) &&
    object(m) &&
    typeof m.grid === "boolean" &&
    atlas(x.atlas) &&
    (m.image === null ||
      (typeof m.image === "string" &&
        m.image.length <= 2_800_000 &&
        /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(m.image)));
  if (!valid)
    throw new Error(
      "Der Spielstand enthält fehlende oder ungültige Werte. Der aktuelle Stand wurde nicht verändert.",
    );
  const state = x as unknown as CampaignState;
  const heroIds = new Set<string>();
  for (const p of state.combat.participants) {
    if (p.kind === "hero") {
      const hero = state.characters.find((c) => c.id === p.characterId);
      if (
        !hero ||
        heroIds.has(hero.id) ||
        hero.hp !== p.hp ||
        hero.maxHp !== p.maxHp ||
        hero.tempHp !== p.tempHp
      )
        throw new Error(
          "Charaktere und Kampfdaten im Spielstand passen nicht zusammen.",
        );
      heroIds.add(hero.id);
    } else if (p.characterId !== undefined)
      throw new Error("Ein Monster darf keinem Charakter zugeordnet sein.");
  }
  return state;
}

export function loadCampaign(): { state: CampaignState; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { state: raw ? parseCampaign(raw) : initialState(), error: null };
  } catch {
    return {
      state: initialState(),
      error:
        "Der lokale Spielstand konnte nicht geladen werden. Beispieldaten sind geöffnet; der bisherige Speicher wird erst bei deiner nächsten Änderung ersetzt.",
    };
  }
}
