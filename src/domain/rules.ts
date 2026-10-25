import type { CampaignState, Combat, Combatant, DiceResult } from "./types.ts";

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export const modifier = (score: number) => Math.floor((score - 10) / 2);
export const signed = (n: number) => (n >= 0 ? "+" + n : String(n));
export const proficiency = (level: number) => 2 + Math.floor((level - 1) / 4);
export const uid = () => crypto.randomUUID();
export const timestamp = () => new Date().toISOString();

export function secureDie(sides: number): number {
  // Rejection sampling avoids modulo bias for dice whose sides do not divide 2^32.
  const range = 0x100000000;
  const limit = Math.floor(range / sides) * sides;
  const values = new Uint32Array(1);
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);
  return (values[0] % sides) + 1;
}

export function rollDice(
  formula: string,
  mode: DiceResult["mode"] = "normal",
  die = secureDie,
): Omit<DiceResult, "id" | "label" | "secret" | "time"> {
  const match = formula
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/w/g, "d")
    .match(/^(\d{0,3})d(\d{1,4})([+-]\d{1,5})?$/);
  if (!match)
    throw new Error("Bitte eine Formel wie 1d20+4 oder 2d6+3 eingeben.");
  const count = Number(match[1] || 1),
    sides = Number(match[2]),
    bonus = Number(match[3] || 0);
  if (
    count < 1 ||
    count > 100 ||
    sides < 2 ||
    sides > 1000 ||
    Math.abs(bonus) > 10000
  )
    throw new Error(
      "Erlaubt: 1–100 Würfel, 2–1000 Seiten und ein Bonus bis ±10000.",
    );
  if (mode !== "normal" && (count !== 1 || sides !== 20))
    throw new Error("Vorteil und Nachteil gelten hier für genau einen W20.");
  const rolls = Array.from({ length: mode === "normal" ? count : 2 }, () =>
    die(sides),
  );
  const subtotal =
    mode === "advantage"
      ? Math.max(...rolls)
      : mode === "disadvantage"
        ? Math.min(...rolls)
        : rolls.reduce((a, b) => a + b, 0);
  return {
    formula: count + "d" + sides + (bonus ? signed(bonus) : ""),
    rolls,
    total: subtotal + bonus,
    modifier: bonus,
    mode,
    sides,
  };
}

/** The d20 that counts after advantage/disadvantage, or null when the roll is not a single d20 check. */
export function naturalD20(
  result: Pick<DiceResult, "rolls" | "sides" | "mode">,
): number | null {
  if (result.sides !== 20) return null;
  if (result.mode === "advantage") return Math.max(...result.rolls);
  if (result.mode === "disadvantage") return Math.min(...result.rolls);
  return result.rolls.length === 1 ? result.rolls[0] : null;
}

export function changeHp<
  T extends { hp: number; maxHp: number; tempHp: number },
>(target: T, amount: number): T {
  if (amount >= 0)
    return { ...target, hp: clamp(target.hp + amount, 0, target.maxHp) };
  const damage = -amount;
  return {
    ...target,
    tempHp: Math.max(0, target.tempHp - damage),
    hp: Math.max(0, target.hp - Math.max(0, damage - target.tempHp)),
  };
}

export const UNCONSCIOUS = "Bewusstlos";

/** Heroes fall unconscious at 0 HP and wake up when healed above it. */
export function withHp<
  T extends {
    kind: Combatant["kind"];
    hp: number;
    tempHp: number;
    conditions: string[];
  },
>(target: T, hp: number, tempHp: number): T {
  let conditions = target.conditions;
  if (target.kind === "hero" && hp === 0 && !conditions.includes(UNCONSCIOUS))
    conditions = [...conditions, UNCONSCIOUS];
  else if (target.hp === 0 && hp > 0)
    conditions = conditions.filter((c) => c !== UNCONSCIOUS);
  return { ...target, hp, tempHp, conditions };
}

export function orderParticipants(participants: Combatant[]) {
  return [...participants].sort(
    (a, b) =>
      b.initiative - a.initiative ||
      b.dexterity - a.dexterity ||
      a.id.localeCompare(b.id),
  );
}

export function nextTurn(combat: Combat): Combat {
  const ordered = orderParticipants(combat.participants);
  const eligible = (p: Combatant) => p.kind === "hero" || p.hp > 0;
  const first = ordered.find(eligible);
  if (!first) return { ...combat, started: false, activeId: null };
  if (!combat.started || !combat.activeId)
    return { ...combat, started: true, activeId: first.id };
  const index = ordered.findIndex((p) => p.id === combat.activeId);
  if (index < 0) return { ...combat, activeId: first.id };
  for (let step = 1; step <= ordered.length; step++) {
    const candidate = ordered[(index + step) % ordered.length];
    if (eligible(candidate))
      return {
        ...combat,
        activeId: candidate.id,
        round: combat.round + (index + step >= ordered.length ? 1 : 0),
      };
  }
  return combat;
}

/** Initiative is rolled once per combat: d20 + DEX modifier for every participant. */
export function rollInitiative(combat: Combat, die = secureDie): Combat {
  if (combat.started) return combat;
  const rolled = combat.participants.map((p) => ({
    ...p,
    initiative: die(20) + modifier(p.dexterity),
  }));
  return appendEvent(
    { ...combat, participants: rolled },
    "Initiative gewürfelt: " +
      orderParticipants(rolled)
        .map((p) => p.name + " " + p.initiative)
        .join(", ") +
      ".",
  );
}

export function appendEvent(combat: Combat, text: string): Combat {
  return {
    ...combat,
    events: [{ id: uid(), text, time: timestamp() }, ...combat.events].slice(
      0,
      150,
    ),
  };
}

export function adjustParticipantHp(
  state: CampaignState,
  id: string,
  amount: number,
): CampaignState {
  const target = state.combat.participants.find((p) => p.id === id);
  if (!target) return state;
  const changed = changeHp(target, amount);
  const updated = withHp(target, changed.hp, changed.tempHp);
  return {
    ...state,
    characters: state.characters.map((c) =>
      c.id === target.characterId
        ? { ...c, hp: updated.hp, tempHp: updated.tempHp }
        : c,
    ),
    combat: appendEvent(
      {
        ...state.combat,
        participants: state.combat.participants.map((p) =>
          p.id === id ? updated : p,
        ),
      },
      target.name +
        (amount < 0
          ? " erleidet " + -amount + " Schaden."
          : " erhält " + amount + " Heilung."),
    ),
  };
}
