import test from "node:test";
import assert from "node:assert/strict";
import {
  rollDice,
  changeHp,
  modifier,
  proficiency,
  nextTurn,
  orderParticipants,
  adjustParticipantHp,
  naturalD20,
  rollInitiative,
} from "../src/domain/rules.ts";
import { initialState } from "../src/domain/seed.ts";
import { parseCampaign } from "../src/domain/storage.ts";

test("Attributsmodifikatoren und Übungsbonus an Stufengrenzen", () => {
  assert.equal(modifier(9), -1);
  assert.equal(modifier(17), 3);
  assert.equal(proficiency(1), 2);
  assert.equal(proficiency(5), 3);
  assert.equal(proficiency(20), 6);
});
test("Mehrere Würfel, deutsche Schreibweise und negative Modifikatoren", () => {
  const values = [2, 6];
  const result = rollDice(" 2W6 - 3 ", "normal", () => values.shift()!);
  assert.deepEqual(result.rolls, [2, 6]);
  assert.equal(result.total, 5);
  assert.equal(result.formula, "2d6-3");
});
test("Vorteil nimmt den höheren, Nachteil den niedrigeren W20", () => {
  const a = [4, 18],
    b = [4, 18];
  assert.equal(rollDice("1d20+3", "advantage", () => a.shift()!).total, 21);
  assert.equal(rollDice("d20+3", "disadvantage", () => b.shift()!).total, 7);
});
test("Ungültige und unbegrenzte Formeln werden vor dem Würfeln verworfen", () => {
  for (const formula of [
    "0d6",
    "101d6",
    "1d1",
    "1d1001",
    "2d6+10001",
    "alert(1)",
    "1d6+2d4",
    "1.5d6",
    "2d6+NaN",
  ]) {
    assert.throws(() => rollDice(formula));
  }
  assert.throws(() => rollDice("2d20", "advantage"));
  assert.throws(() => rollDice("1d6", "disadvantage"));
});
test("Schaden verbraucht temporäre TP zuerst und fällt nicht unter null", () => {
  const original = { hp: 10, maxHp: 20, tempHp: 5 };
  assert.deepEqual(changeHp(original, -3), { hp: 10, maxHp: 20, tempHp: 2 });
  assert.deepEqual(changeHp(original, -9), { hp: 6, maxHp: 20, tempHp: 0 });
  assert.deepEqual(changeHp(original, -100), { hp: 0, maxHp: 20, tempHp: 0 });
  assert.equal(original.hp, 10);
});
test("Heilung ist begrenzt und verändert temporäre TP nicht", () => {
  assert.deepEqual(changeHp({ hp: 15, maxHp: 20, tempHp: 3 }, 50), {
    hp: 20,
    maxHp: 20,
    tempHp: 3,
  });
});
test("Kampfschaden synchronisiert Charakterbogen und Teilnehmer", () => {
  const state = initialState();
  state.characters[0].tempHp = 3;
  state.combat.participants[0].tempHp = 3;
  const next = adjustParticipantHp(state, "hero-aelira", -5);
  assert.equal(next.characters[0].hp, 22);
  assert.equal(next.characters[0].tempHp, 0);
  assert.equal(next.combat.participants[0].hp, 22);
  assert.equal(next.combat.events.length, 1);
  assert.equal(state.characters[0].hp, 24);
});
test("Initiative sortiert ohne Mutation und löst Gleichstände stabil auf", () => {
  const state = initialState();
  const participants = state.combat.participants
    .slice(0, 3)
    .map((p) => ({ ...p, initiative: 12 }));
  const before = participants.map((p) => p.id);
  const sorted = orderParticipants(participants);
  assert.equal(sorted[0].id, "hero-aelira");
  assert.deepEqual(
    participants.map((p) => p.id),
    before,
  );
});
test("Kampfbeginn, besiegte Gegner überspringen und Rundenwechsel", () => {
  const state = initialState();
  state.combat.participants = state.combat.participants.map((p) =>
    p.kind === "monster" ? { ...p, hp: 0 } : p,
  );
  let combat = nextTurn(state.combat);
  assert.equal(combat.activeId, "hero-aelira");
  assert.equal(combat.round, 1);
  combat = nextTurn(combat);
  assert.equal(combat.activeId, "hero-lyra");
  combat = nextTurn(combat);
  assert.equal(combat.activeId, "hero-brom");
  combat = nextTurn(combat);
  assert.equal(combat.activeId, "hero-aelira");
  assert.equal(combat.round, 2);
});
test("Charaktere bei 0 TP behalten ihren Zug; ohne kampffähige Gegner endet leere Initiative", () => {
  const state = initialState();
  const hero = { ...state.combat.participants[0], hp: 0 };
  const deadMonster = {
    ...state.combat.participants.find((p) => p.kind === "monster")!,
    hp: 0,
  };
  assert.equal(
    nextTurn({ ...state.combat, participants: [hero, deadMonster] }).activeId,
    hero.id,
  );
  const ended = nextTurn({ ...state.combat, participants: [deadMonster] });
  assert.equal(ended.started, false);
  assert.equal(ended.activeId, null);
});
test("JSON-Export und Import erhalten den gesamten Spielstand", () => {
  const state = initialState();
  state.campaign.notes += "\nÄöü, Würfel und Abenteuer.";
  assert.deepEqual(parseCampaign(JSON.stringify(state)), state);
});
test("Ungültige Versionen, Beziehungen und Spielwerte werden abgewiesen", () => {
  assert.throws(() => parseCampaign("kein json"));
  assert.throws(() => parseCampaign('{"schemaVersion":2}'));
  const original = initialState();
  const invalidHp = structuredClone(original);
  invalidHp.characters[0].hp = -1;
  assert.throws(() => parseCampaign(JSON.stringify(invalidHp)));
  const mismatch = structuredClone(original);
  mismatch.combat.participants[0].hp = 1;
  assert.throws(() => parseCampaign(JSON.stringify(mismatch)));
  const duplicate = structuredClone(original);
  duplicate.characters.push(duplicate.characters[0]);
  assert.throws(() => parseCampaign(JSON.stringify(duplicate)));
  const active = structuredClone(original);
  active.combat.started = true;
  assert.throws(() => parseCampaign(JSON.stringify(active)));
  const image = structuredClone(original);
  image.map.image = "javascript:alert(1)";
  assert.throws(() => parseCampaign(JSON.stringify(image)));
  assert.deepEqual(original, initialState());
});
test("Kritisch und Patzer zählen nur den behaltenen W20", () => {
  assert.equal(naturalD20({ rolls: [20, 5], sides: 20, mode: "disadvantage" }), 5);
  assert.equal(naturalD20({ rolls: [1, 20], sides: 20, mode: "advantage" }), 20);
  assert.equal(naturalD20({ rolls: [1, 14], sides: 20, mode: "advantage" }), 14);
  assert.equal(naturalD20({ rolls: [1], sides: 20, mode: "normal" }), 1);
  assert.equal(naturalD20({ rolls: [20, 3, 7], sides: 20, mode: "normal" }), null);
  assert.equal(naturalD20({ rolls: [6], sides: 6, mode: "normal" }), null);
});
test("Initiative: W20 plus GES-Modifikator, nur vor Kampfbeginn", () => {
  const state = initialState();
  const combat = rollInitiative(state.combat, () => 10);
  const lyra = combat.participants.find((p) => p.id === "hero-lyra")!;
  const goblin = combat.participants.find((p) => p.kind === "monster")!;
  assert.equal(lyra.initiative, 12);
  assert.equal(goblin.initiative, 12);
  assert.match(combat.events[0].text, /Lyra Funkenflug 12/);
  const running = { ...state.combat, started: true, activeId: "hero-brom" };
  assert.equal(rollInitiative(running, () => 20), running);
});
test("Helden werden bei 0 TP bewusstlos und wachen durch Heilung auf", () => {
  let state = initialState();
  state = adjustParticipantHp(state, "hero-lyra", -100);
  const down = state.combat.participants.find((p) => p.id === "hero-lyra")!;
  assert.equal(down.hp, 0);
  assert.deepEqual(down.conditions, ["Bewusstlos"]);
  state = adjustParticipantHp(state, "hero-lyra", -3);
  assert.deepEqual(
    state.combat.participants.find((p) => p.id === "hero-lyra")!.conditions,
    ["Bewusstlos"],
  );
  state = adjustParticipantHp(state, "hero-lyra", 4);
  const up = state.combat.participants.find((p) => p.id === "hero-lyra")!;
  assert.equal(up.hp, 4);
  assert.deepEqual(up.conditions, []);
  state = adjustParticipantHp(state, "goblin-0", -100);
  assert.deepEqual(
    state.combat.participants.find((p) => p.id === "goblin-0")!.conditions,
    [],
  );
});
test("Beispieldaten folgen den Regeln für TP und Rüstungsklasse", () => {
  const { characters, combat } = initialState();
  const byName = (name: string) => characters.find((c) => c.name.startsWith(name))!;
  // Stufe 1: maximaler Trefferwürfel, danach Durchschnitt; jeweils plus KON-Modifikator.
  const hp = (die: number, level: number, con: number, perLevel = 0) =>
    die + modifier(con) + (level - 1) * (die / 2 + 1 + modifier(con)) + perLevel * level;
  const aelira = byName("Aelira"),
    brom = byName("Brom"),
    lyra = byName("Lyra");
  assert.equal(aelira.maxHp, hp(10, aelira.level, aelira.stats.constitution));
  // Zwergische Zähigkeit: +1 TP je Stufe.
  assert.equal(brom.maxHp, hp(10, brom.level, brom.stats.constitution, 1));
  assert.equal(lyra.maxHp, hp(6, lyra.level, lyra.stats.constitution));
  const armor = brom.inventory.filter((i) => i.equipped && i.category === "Rüstung");
  assert.deepEqual(armor.map((i) => i.name).sort(), ["Kettenpanzer", "Rundschild"]);
  assert.equal(brom.ac, 16 + 2);
  // Beschlagenes Leder (12) + GES; Magierin ohne Rüstung: 10 + GES.
  assert.ok(aelira.inventory.some((i) => i.name === "Beschlagenes Leder" && i.equipped));
  assert.equal(aelira.ac, 12 + modifier(aelira.stats.dexterity));
  assert.equal(lyra.ac, 10 + modifier(lyra.stats.dexterity));
  for (const goblin of combat.participants.filter((p) => p.kind === "monster")) {
    assert.equal(goblin.ac, 15);
    assert.equal(goblin.maxHp, 7);
  }
});
