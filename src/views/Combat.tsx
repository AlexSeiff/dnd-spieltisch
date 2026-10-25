import { useState } from "react";
import {
  Plus,
  Swords,
  Play,
  SkipForward,
  Heart,
  Shield,
  Dices,
  Skull,
  X,
  Flag,
  History,
} from "lucide-react";
import type { CampaignState, Combatant, Role } from "../domain/types";
import { CONDITIONS } from "../domain/types";
import {
  orderParticipants,
  nextTurn,
  appendEvent,
  rollInitiative,
  adjustParticipantHp,
  uid,
} from "../domain/rules";
import { Avatar, HpBar, Modal, Empty, timeLabel } from "../components/ui";
import type { Change } from "../components/ui";

export function CombatView({
  state,
  change,
  role,
  ownId,
}: {
  state: CampaignState;
  change: Change;
  role: Role;
  ownId: string;
}) {
  const [selectedId, setSelectedId] = useState(
    state.combat.activeId || state.combat.participants[0]?.id || "",
  );
  const [amount, setAmount] = useState(5);
  const [addOpen, setAddOpen] = useState(false);
  const [condition, setCondition] = useState("");
  const ordered = orderParticipants(state.combat.participants);
  const selected = ordered.find((p) => p.id === selectedId) || ordered[0];
  const active = ordered.find((p) => p.id === state.combat.activeId);
  const editable =
    selected && (role === "gm" || selected.characterId === ownId);
  const reveal = selected && (role === "gm" || selected.kind === "hero");
  const monsters = ordered.filter((p) => p.kind === "monster");
  function advance() {
    change((s) => {
      const next = nextTurn(s.combat);
      const target = next.participants.find((p) => p.id === next.activeId);
      return {
        ...s,
        combat: appendEvent(
          next,
          target
            ? "Runde " + next.round + ": " + target.name + " ist am Zug."
            : "Keine aktiven Kampfteilnehmer vorhanden.",
        ),
      };
    });
  }
  function addMonster(form: HTMLFormElement) {
    const data = new FormData(form),
      id = uid();
    const monster: Combatant = {
      id,
      name: String(data.get("name")).trim(),
      kind: "monster",
      hp: Number(data.get("hp")),
      maxHp: Number(data.get("hp")),
      tempHp: 0,
      ac: Number(data.get("ac")),
      dexterity: Number(data.get("dexterity")),
      initiative: Number(data.get("initiative")),
      conditions: [],
      x: 8,
      y: 2,
      color: "red",
    };
    change((s) => ({
      ...s,
      combat: appendEvent(
        { ...s.combat, participants: [...s.combat.participants, monster] },
        monster.name + " tritt der Begegnung bei.",
      ),
    }));
    setSelectedId(id);
    setAddOpen(false);
  }
  function rollAll() {
    change((s) => ({ ...s, combat: rollInitiative(s.combat) }));
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">JEDER ZUG ZÄHLT</div>
          <h1>
            Kampfübersicht<span className="heading-dot">.</span>
          </h1>
          <p>
            Initiative, Trefferpunkte und Zustände. Behalte das Gefecht im
            Blick.
          </p>
        </div>
        {role === "gm" && (
          <button
            className="button subtle"
            disabled={ordered.length >= 200}
            onClick={() => setAddOpen(true)}
          >
            <Plus size={17} />
            Monster hinzufügen
          </button>
        )}
      </div>
      <section className="combat-control card">
        <div className="encounter-control-title">
          <span className="action-icon red">
            <Swords size={23} />
          </span>
          <div>
            <span className="eyebrow">AKTUELLE BEGEGNUNG</span>
            <h2>{state.combat.name}</h2>
            <p>
              {monsters.filter((p) => p.hp > 0).length} / {monsters.length}{" "}
              Gegner kampffähig · {state.characters.length} Helden
            </p>
          </div>
        </div>
        <div className="combat-turn">
          <span>RUNDE</span>
          <b>{String(state.combat.round).padStart(2, "0")}</b>
        </div>
        {role === "gm" && (
          <div className="button-group">
            {state.combat.started && (
              <button
                className="icon-button"
                title="Kampf beenden und Rundenzähler zurücksetzen"
                aria-label="Kampf beenden"
                onClick={() =>
                  change((s) => ({
                    ...s,
                    combat: appendEvent(
                      { ...s.combat, started: false, activeId: null, round: 1 },
                      "Kampf beendet. Trefferpunkte und Zustände bleiben erhalten.",
                    ),
                  }))
                }
              >
                <Flag size={19} />
              </button>
            )}
            <button
              className="button primary"
              onClick={advance}
              disabled={!ordered.some((p) => p.kind === "hero" || p.hp > 0)}
            >
              {state.combat.started ? (
                <SkipForward size={18} />
              ) : (
                <Play size={18} />
              )}{" "}
              {state.combat.started ? "Nächster Zug" : "Kampf starten"}
            </button>
          </div>
        )}
      </section>
      {active && (
        <div className="active-turn-notice">
          <span className="status-dot" />
          <strong>{active.name}</strong> ist am Zug.
          <span>Runde {state.combat.round}</span>
        </div>
      )}
      <div className="combat-layout">
        <section className="card combat-list">
          <div className="card-heading">
            <h2>
              <Swords size={18} />
              Initiativreihenfolge
            </h2>
            {role === "gm" && (
              <button
                className="button ghost small-button"
                onClick={rollAll}
                disabled={!ordered.length || state.combat.started}
                title={
                  state.combat.started
                    ? "Initiative wird einmal zu Kampfbeginn gewürfelt"
                    : undefined
                }
              >
                <Dices size={15} />
                Alle würfeln
              </button>
            )}
          </div>
          <div className="combat-table-heading">
            <span>INIT.</span>
            <span>TEILNEHMER</span>
            <span>RK</span>
          </div>
          {!ordered.length && (
            <Empty>Füge einen Charakter oder ein Monster hinzu.</Empty>
          )}
          {ordered.map((p) => (
            <div
              key={p.id}
              className={
                "combat-row" +
                (p.id === selected?.id ? " selected" : "") +
                (p.id === active?.id ? " active" : "") +
                (p.hp === 0 ? " defeated" : "")
              }
            >
              {role === "gm" ? (
                <input
                  className="initiative-input"
                  aria-label={"Initiative " + p.name}
                  type="number"
                  min={-100}
                  max={1000}
                  value={p.initiative}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (
                      Number.isInteger(value) &&
                      value >= -100 &&
                      value <= 1000
                    )
                      change((s) => ({
                        ...s,
                        combat: {
                          ...s.combat,
                          participants: s.combat.participants.map((x) =>
                            x.id === p.id ? { ...x, initiative: value } : x,
                          ),
                        },
                      }));
                  }}
                />
              ) : (
                <span className="initiative-input">{p.initiative}</span>
              )}
              <button
                className="combat-select"
                onClick={() => {
                  setSelectedId(p.id);
                  setCondition("");
                }}
                aria-label={p.name + " auswählen"}
              >
                <Avatar
                  name={p.name}
                  color={p.color}
                  monster={p.kind === "monster"}
                />
                <span className="combat-name">
                  <strong>
                    {p.name}
                    {p.id === active?.id && (
                      <span className="turn-label">AM ZUG</span>
                    )}
                  </strong>
                  <span>
                    {p.kind === "hero"
                      ? "Spielercharakter"
                      : p.hp === 0
                        ? "Besiegt"
                        : "Monster"}
                    {p.conditions.length > 0 && " · " + p.conditions.join(", ")}
                  </span>
                  {(role === "gm" || p.kind === "hero") && (
                    <HpBar hp={p.hp} maxHp={p.maxHp} />
                  )}
                </span>
                <span className="combat-hp">
                  {role === "gm" || p.kind === "hero" ? (
                    <>
                      <b>{p.hp}</b>
                      <small> / {p.maxHp} TP</small>
                      {p.tempHp > 0 && <em>+{p.tempHp} temp.</em>}
                    </>
                  ) : (
                    <span className="muted">? TP</span>
                  )}
                </span>
              </button>
              <span className="armor-value">
                <Shield size={14} />
                {role === "gm" || p.kind === "hero" ? p.ac : "?"}
              </span>
            </div>
          ))}
        </section>
        <aside className="combat-detail card">
          {selected ? (
            <>
              <div className="card-heading">
                <h2>
                  {selected.kind === "monster" ? (
                    <Skull size={18} />
                  ) : (
                    <Heart size={18} />
                  )}
                  Teilnehmer
                </h2>
                <span className="badge">
                  {selected.kind === "monster" ? "Monster" : "Held"}
                </span>
              </div>
              <div className="selected-combatant">
                <Avatar
                  name={selected.name}
                  color={selected.color}
                  monster={selected.kind === "monster"}
                />
                <h3>{selected.name}</h3>
                {reveal ? (
                  <>
                    <div className="hp-large">
                      <b>{selected.hp}</b>
                      <span>/ {selected.maxHp} TP</span>
                    </div>
                    <HpBar hp={selected.hp} maxHp={selected.maxHp} />
                  </>
                ) : (
                  <p className="muted">
                    Die Werte dieses Gegners kennt der Spielleiter.
                  </p>
                )}
              </div>
              {editable && (
                <div className="damage-controls">
                  <label className="field">
                    Schaden / Heilung
                    <input
                      aria-label="Schaden oder Heilung Betrag"
                      type="number"
                      min={1}
                      max={100000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </label>
                  <div className="button-group">
                    <button
                      className="button danger"
                      disabled={
                        !Number.isInteger(amount) ||
                        amount < 1 ||
                        amount > 100000
                      }
                      onClick={() =>
                        change((s) =>
                          adjustParticipantHp(s, selected.id, -amount),
                        )
                      }
                    >
                      − Schaden
                    </button>
                    <button
                      className="button subtle"
                      disabled={
                        !Number.isInteger(amount) ||
                        amount < 1 ||
                        amount > 100000
                      }
                      onClick={() =>
                        change((s) =>
                          adjustParticipantHp(s, selected.id, amount),
                        )
                      }
                    >
                      + Heilung
                    </button>
                  </div>
                  <label className="field temp-hp">
                    Temporäre Trefferpunkte
                    <input
                      type="number"
                      min={0}
                      max={100000}
                      value={selected.tempHp}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (
                          Number.isInteger(value) &&
                          value >= 0 &&
                          value <= 100000
                        )
                          change((s) => ({
                            ...s,
                            characters: s.characters.map((c) =>
                              c.id === selected.characterId
                                ? { ...c, tempHp: value }
                                : c,
                            ),
                            combat: {
                              ...s.combat,
                              participants: s.combat.participants.map((p) =>
                                p.id === selected.id
                                  ? { ...p, tempHp: value }
                                  : p,
                              ),
                            },
                          }));
                      }}
                    />
                  </label>
                </div>
              )}
              <div className="conditions-section">
                <h3>Zustände</h3>
                <div className="condition-tags">
                  {selected.conditions.length ? (
                    selected.conditions.map((c) => (
                      <span className="condition-tag" key={c}>
                        {c}
                        {editable && (
                          <button
                            aria-label={c + " entfernen"}
                            onClick={() =>
                              change((s) => ({
                                ...s,
                                combat: appendEvent(
                                  {
                                    ...s.combat,
                                    participants: s.combat.participants.map(
                                      (p) =>
                                        p.id === selected.id
                                          ? {
                                              ...p,
                                              conditions: p.conditions.filter(
                                                (x) => x !== c,
                                              ),
                                            }
                                          : p,
                                    ),
                                  },
                                  selected.name + ": " + c + " endet.",
                                ),
                              }))
                            }
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="muted">Keine aktiven Zustände.</span>
                  )}
                </div>
                {editable && (
                  <select
                    aria-label="Zustand hinzufügen"
                    value={condition}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCondition("");
                      if (value)
                        change((s) => ({
                          ...s,
                          combat: appendEvent(
                            {
                              ...s.combat,
                              participants: s.combat.participants.map((p) =>
                                p.id === selected.id
                                  ? {
                                      ...p,
                                      conditions: [...p.conditions, value],
                                    }
                                  : p,
                              ),
                            },
                            selected.name + ": " + value + ".",
                          ),
                        }));
                    }}
                  >
                    <option value="">+ Zustand hinzufügen</option>
                    {CONDITIONS.filter(
                      (c) => !selected.conditions.includes(c),
                    ).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
              {role === "gm" && selected.kind === "monster" && (
                <button
                  className="button ghost remove-participant"
                  onClick={() =>
                    change((s) => {
                      let combat =
                        s.combat.activeId === selected.id
                          ? nextTurn(s.combat)
                          : s.combat;
                      combat = {
                        ...combat,
                        participants: combat.participants.filter(
                          (p) => p.id !== selected.id,
                        ),
                      };
                      if (
                        !combat.participants.some(
                          (p) => p.id === combat.activeId,
                        )
                      )
                        combat = combat.started
                          ? nextTurn({ ...combat, activeId: null })
                          : { ...combat, activeId: null };
                      return {
                        ...s,
                        combat: appendEvent(
                          combat,
                          selected.name + " aus der Begegnung entfernt.",
                        ),
                      };
                    })
                  }
                >
                  <X size={14} />
                  Aus Begegnung entfernen
                </button>
              )}
            </>
          ) : (
            <Empty>Wähle einen Teilnehmer aus.</Empty>
          )}
        </aside>
      </div>
      <section className="card history-card">
        <div className="card-heading">
          <h2>
            <History size={18} />
            Kampfverlauf
          </h2>
          <span className="muted">Letzte 150 Ereignisse</span>
        </div>
        {!state.combat.events.length ? (
          <Empty>
            Starte den Kampf – hier wird eure Begegnung festgehalten.
          </Empty>
        ) : (
          <div className="combat-events">
            {state.combat.events.slice(0, 30).map((event) => (
              <div key={event.id}>
                <time>{timeLabel(event.time)}</time>
                <span>{event.text}</span>
              </div>
            ))}
          </div>
        )}
      </section>
      {addOpen && (
        <Modal title="Monster hinzufügen" onClose={() => setAddOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addMonster(e.currentTarget);
            }}
          >
            <label className="field">
              Name
              <input
                autoFocus
                required
                maxLength={100}
                name="name"
                placeholder="z. B. Höhlentroll"
              />
            </label>
            <div className="form-grid">
              {[
                {
                  name: "hp",
                  label: "Trefferpunkte",
                  min: 1,
                  max: 100000,
                  value: 12,
                },
                {
                  name: "ac",
                  label: "Rüstungsklasse",
                  min: 0,
                  max: 100,
                  value: 12,
                },
                {
                  name: "dexterity",
                  label: "Geschicklichkeit",
                  min: 1,
                  max: 30,
                  value: 10,
                },
                {
                  name: "initiative",
                  label: "Initiative",
                  min: -100,
                  max: 1000,
                  value: 10,
                },
              ].map((f) => (
                <label className="field" key={f.name}>
                  {f.label}
                  <input
                    type="number"
                    name={f.name}
                    min={f.min}
                    max={f.max}
                    required
                    defaultValue={f.value}
                  />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button
                className="button ghost"
                type="button"
                onClick={() => setAddOpen(false)}
              >
                Abbrechen
              </button>
              <button className="button primary" type="submit">
                <Plus size={16} />
                Hinzufügen
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
