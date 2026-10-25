import { useState } from "react";
import {
  Plus,
  Pencil,
  Shield,
  Heart,
  Footprints,
  Dices,
  Check,
  Coins,
} from "lucide-react";
import type { CampaignState, Character, Role } from "../domain/types";
import { STATS, SKILLS } from "../domain/types";
import { createCharacter, heroParticipant } from "../domain/seed";
import {
  modifier,
  signed,
  proficiency,
  changeHp,
  clamp,
  withHp,
} from "../domain/rules";
import { Avatar, HpBar, Modal, Empty } from "../components/ui";
import type { Change } from "../components/ui";
import type { Roll } from "./DiceRoom";

export function Characters({
  state,
  change,
  selectedId,
  select,
  role,
  ownId,
  roll,
}: {
  state: CampaignState;
  change: Change;
  selectedId: string;
  select: (id: string) => void;
  role: Role;
  ownId: string;
  roll: Roll;
}) {
  const [draft, setDraft] = useState<Character | null>(null);
  const visible =
    role === "player"
      ? state.characters.filter((c) => c.id === ownId)
      : state.characters;
  const character = visible.find((c) => c.id === selectedId) || visible[0];
  function saveCharacter(c: Character) {
    const updated = {
      ...c,
      hp: clamp(c.hp, 0, c.maxHp),
      name: c.name.trim() || "Neuer Held",
    };
    change((s) => ({
      ...s,
      characters: s.characters.some((x) => x.id === c.id)
        ? s.characters.map((x) => (x.id === c.id ? updated : x))
        : [...s.characters, updated],
      combat: {
        ...s.combat,
        participants: s.characters.some((x) => x.id === c.id)
          ? s.combat.participants.map((p) =>
              p.characterId === c.id
                ? {
                    ...withHp(p, updated.hp, updated.tempHp),
                    name: updated.name,
                    maxHp: updated.maxHp,
                    ac: updated.ac,
                    dexterity: updated.stats.dexterity,
                    color: updated.color,
                  }
                : p,
            )
          : [
              ...s.combat.participants,
              heroParticipant(updated, s.characters.length % 8),
            ],
      },
    }));
    select(c.id);
    setDraft(null);
  }
  function hpChange(amount: number) {
    if (!character) return;
    const updated = changeHp(character, amount);
    change((s) => ({
      ...s,
      characters: s.characters.map((c) =>
        c.id === character.id ? updated : c,
      ),
      combat: {
        ...s.combat,
        participants: s.combat.participants.map((p) =>
          p.characterId === character.id
            ? withHp(p, updated.hp, updated.tempHp)
            : p,
        ),
      },
    }));
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DIE GESICHTER EURER GESCHICHTE</div>
          <h1>
            Deine Helden<span className="heading-dot">.</span>
          </h1>
          <p>Alle Werte griffbereit. Ein Klick für den nächsten Wurf.</p>
        </div>
        {role === "gm" && (
          <button
            className="button primary"
            disabled={state.characters.length >= 100}
            onClick={() => setDraft(createCharacter())}
          >
            <Plus size={17} />
            Charakter anlegen
          </button>
        )}
      </div>
      <div className="character-tabs">
        {visible.map((c) => (
          <button
            key={c.id}
            className={
              "character-tab" + (character?.id === c.id ? " active" : "")
            }
            onClick={() => select(c.id)}
          >
            <Avatar name={c.name} color={c.color} small />
            <span>
              {c.name}
              <small>
                {c.className} · Stufe {c.level}
              </small>
            </span>
          </button>
        ))}
      </div>
      {!character ? (
        <Empty>Lege deinen ersten Charakter an.</Empty>
      ) : (
        <div className="character-layout">
          <section
            key={character.id}
            className="card character-sheet parchment-scroll"
          >
            <div className="character-banner">
              <Avatar name={character.name} color={character.color} />
              <div>
                <span className="eyebrow">
                  {character.ancestry} · STUFE {character.level}
                </span>
                <h2>{character.name}</h2>
                <p>{character.className}</p>
              </div>
              <button
                className="button subtle small-button"
                onClick={() => setDraft(structuredClone(character))}
              >
                <Pencil size={15} />
                Bearbeiten
              </button>
            </div>
            <div className="character-vitals">
              <div>
                <Shield size={18} />
                <b>{character.ac}</b>
                <span>Rüstungsklasse</span>
              </div>
              <div>
                <Footprints size={18} />
                <b>
                  {character.speed}
                  <small> m</small>
                </b>
                <span>Bewegung</span>
              </div>
              <div>
                <Dices size={18} />
                <b>{signed(proficiency(character.level))}</b>
                <span>Übungsbonus</span>
              </div>
              <div>
                <Coins size={18} />
                <b>{character.gold}</b>
                <span>Goldstücke</span>
              </div>
            </div>
            <div className="sheet-section">
              <div className="section-heading">
                <h3>Attribute</h3>
                <span className="muted">Klicken zum Würfeln</span>
              </div>
              <div className="stat-grid">
                {STATS.map((stat) => (
                  <button
                    key={stat.key}
                    className="stat-card"
                    title={stat.label + " würfeln"}
                    onClick={() =>
                      roll(
                        "1d20" + signed(modifier(character.stats[stat.key])),
                        character.name + " · " + stat.label,
                      )
                    }
                  >
                    <span>{stat.short}</span>
                    <strong>
                      {signed(modifier(character.stats[stat.key]))}
                    </strong>
                    <small>{character.stats[stat.key]}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="sheet-section">
              <div className="section-heading">
                <h3>Fertigkeiten</h3>
                <span className="muted">
                  <span className="proficient-dot" />
                  Geübt
                </span>
              </div>
              <div className="skill-grid">
                {SKILLS.map((skill) => {
                  const trained = character.proficiencies.includes(skill.name),
                    bonus =
                      modifier(character.stats[skill.stat]) +
                      (trained ? proficiency(character.level) : 0);
                  return (
                    <button
                      key={skill.name}
                      className="skill-row"
                      onClick={() =>
                        roll(
                          "1d20" + signed(bonus),
                          character.name + " · " + skill.name,
                        )
                      }
                    >
                      <span
                        className={"skill-marker" + (trained ? " trained" : "")}
                      >
                        {trained && <Check size={10} />}
                      </span>
                      <span>{skill.name}</span>
                      <b>{signed(bonus)}</b>
                      <Dices size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
          <aside className="character-aside">
            <section className="card hp-card parchment-card">
              <div className="card-heading">
                <h2>
                  <Heart size={18} />
                  Trefferpunkte
                </h2>
              </div>
              <div className="hp-large">
                <b>{character.hp}</b>
                <span>/ {character.maxHp}</span>
              </div>
              <HpBar hp={character.hp} maxHp={character.maxHp} />
              <p className="muted">Temporäre TP: {character.tempHp}</p>
              <div className="button-group hp-buttons">
                <button className="button danger" onClick={() => hpChange(-1)}>
                  −1 TP
                </button>
                <button className="button subtle" onClick={() => hpChange(1)}>
                  +1 TP
                </button>
                <button
                  className="button subtle"
                  onClick={() => hpChange(character.maxHp - character.hp)}
                >
                  Heilen
                </button>
              </div>
            </section>
            <section className="card personal-notes notebook-mini">
              <div className="card-heading">
                <h2>Charakternotizen</h2>
                <button
                  className="icon-button"
                  aria-label="Charakternotizen bearbeiten"
                  onClick={() => setDraft(structuredClone(character))}
                >
                  <Pencil size={16} />
                </button>
              </div>
              <p className="preserve-lines">
                {character.notes ||
                  "Was treibt deinen Helden an? Hinterlege Ziele und Erinnerungen über Bearbeiten."}
              </p>
            </section>
            <div className="hint-box">
              <Dices size={19} />
              <p>
                Attribut oder Fertigkeit anklicken – der passende Bonus wird
                automatisch mitgewürfelt.
              </p>
            </div>
          </aside>
        </div>
      )}
      {draft && (
        <Modal
          title={
            state.characters.some((c) => c.id === draft.id)
              ? "Charakter bearbeiten"
              : "Neuer Charakter"
          }
          onClose={() => setDraft(null)}
          wide
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveCharacter(draft);
            }}
          >
            <div className="form-grid">
              <label className="field span-2">
                Name
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label className="field">
                Volk / Herkunft
                <input
                  maxLength={100}
                  value={draft.ancestry}
                  onChange={(e) =>
                    setDraft({ ...draft, ancestry: e.target.value })
                  }
                />
              </label>
              <label className="field">
                Klasse
                <input
                  maxLength={100}
                  value={draft.className}
                  onChange={(e) =>
                    setDraft({ ...draft, className: e.target.value })
                  }
                />
              </label>
              {(
                [
                  ["level", "Stufe", 1, 20],
                  ["maxHp", "Maximale TP", 1, 100000],
                  ["hp", "Aktuelle TP", 0, draft.maxHp],
                  ["tempHp", "Temporäre TP", 0, 100000],
                  ["ac", "Rüstungsklasse", 0, 100],
                  ["speed", "Bewegung (m)", 0, 1000],
                ] as const
              ).map(([key, label, min, max]) => (
                <label className="field" key={key}>
                  {label}
                  <input
                    type="number"
                    required
                    min={min}
                    max={max}
                    step={key === "speed" ? ".5" : "1"}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft({ ...draft, [key]: Number(e.target.value) })
                    }
                  />
                </label>
              ))}
              <label className="field span-2">
                Farbe
                <select
                  value={draft.color}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      color: e.target.value as Character["color"],
                    })
                  }
                >
                  <option value="sage">Salbeigrün</option>
                  <option value="amber">Bernstein</option>
                  <option value="violet">Violett</option>
                  <option value="red">Rot</option>
                </select>
              </label>
            </div>
            <h3 className="form-subheading">Attribute</h3>
            <div className="stat-edit-grid">
              {STATS.map((stat) => (
                <label className="field" key={stat.key}>
                  {stat.short}
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={draft.stats[stat.key]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        stats: {
                          ...draft.stats,
                          [stat.key]: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <h3 className="form-subheading">Geübte Fertigkeiten</h3>
            <div className="checkbox-grid">
              {SKILLS.map((skill) => (
                <label className="checkbox-label" key={skill.name}>
                  <input
                    type="checkbox"
                    checked={draft.proficiencies.includes(skill.name)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        proficiencies: e.target.checked
                          ? [...draft.proficiencies, skill.name]
                          : draft.proficiencies.filter((x) => x !== skill.name),
                      })
                    }
                  />
                  {skill.name}
                </label>
              ))}
            </div>
            <label className="field">
              Notizen
              <textarea
                className="handwritten-notes"
                rows={3}
                maxLength={20000}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                className="button ghost"
                onClick={() => setDraft(null)}
              >
                Abbrechen
              </button>
              <button className="button primary" type="submit">
                <Check size={16} />
                Speichern
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
