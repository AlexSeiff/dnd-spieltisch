import { useState } from "react";
import {
  Plus,
  Search,
  Coins,
  Weight,
  Backpack,
  Sword,
  Shield,
  FlaskConical,
  Package,
  Minus,
  Trash2,
  Check,
} from "lucide-react";
import type { CampaignState, Character, Item, Role } from "../domain/types";
import { uid, clamp } from "../domain/rules";
import { Avatar, Modal, Empty } from "../components/ui";
import type { Change } from "../components/ui";

const CATEGORIES = [
  "Ausrüstung",
  "Waffe",
  "Rüstung",
  "Verbrauch",
  "Munition",
  "Schatz",
  "Sonstiges",
];
function ItemIcon({ category }: { category: string }) {
  return category === "Waffe" ? (
    <Sword size={20} />
  ) : category === "Rüstung" ? (
    <Shield size={20} />
  ) : category === "Verbrauch" ? (
    <FlaskConical size={20} />
  ) : (
    <Package size={20} />
  );
}
export function Inventory({
  state,
  change,
  selectedId,
  select,
  role,
  ownId,
}: {
  state: CampaignState;
  change: Change;
  selectedId: string;
  select: (id: string) => void;
  role: Role;
  ownId: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Alle");
  const [draft, setDraft] = useState<Item | null>(null);
  const visible =
    role === "player"
      ? state.characters.filter((c) => c.id === ownId)
      : state.characters;
  const character = visible.find((c) => c.id === selectedId) || visible[0];
  const update = (fn: (c: Character) => Character) => {
    if (character)
      change((s) => ({
        ...s,
        characters: s.characters.map((c) =>
          c.id === character.id ? fn(c) : c,
        ),
      }));
  };
  const items =
    character?.inventory.filter(
      (i) =>
        (filter === "Alle" || i.category === filter) &&
        (i.name + " " + i.description)
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) || [];
  const weight =
    character?.inventory.reduce((sum, i) => sum + i.quantity * i.weight, 0) ||
    0;
  const count =
    character?.inventory.reduce((sum, i) => sum + i.quantity, 0) || 0;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">FÜR ALLES, WAS NOCH KOMMT</div>
          <h1>
            Gut ausgerüstet<span className="heading-dot">.</span>
          </h1>
          <p>Von der treuen Klinge bis zum letzten Heiltrank.</p>
        </div>
        <button
          className="button primary"
          disabled={!character || character.inventory.length >= 300}
          onClick={() =>
            setDraft({
              id: uid(),
              name: "",
              category: "Ausrüstung",
              quantity: 1,
              weight: 0,
              description: "",
              equipped: false,
            })
          }
        >
          <Plus size={17} />
          Gegenstand hinzufügen
        </button>
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
              <small>{c.inventory.length} Einträge</small>
            </span>
          </button>
        ))}
      </div>
      {!character ? (
        <Empty>Lege zuerst einen Charakter an.</Empty>
      ) : (
        <>
          <div className="inventory-stats">
            <section className="card inventory-stat">
              <span className="action-icon amber">
                <Coins size={24} />
              </span>
              <div>
                <label htmlFor="gold">Goldstücke</label>
                <input
                  id="gold"
                  aria-label="Goldstücke"
                  type="number"
                  min={0}
                  max={1000000000}
                  step=".01"
                  value={character.gold}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (Number.isFinite(value) && value >= 0 && value <= 1e9)
                      update((c) => ({ ...c, gold: value }));
                  }}
                />
              </div>
              <small>GM</small>
            </section>
            <section className="card inventory-stat">
              <span className="action-icon sage">
                <Weight size={24} />
              </span>
              <div>
                <span>Gesamtgewicht</span>
                <b>
                  {weight.toLocaleString("de-DE", { maximumFractionDigits: 2 })}
                  <small> kg</small>
                </b>
              </div>
            </section>
            <section className="card inventory-stat">
              <span className="action-icon violet">
                <Backpack size={24} />
              </span>
              <div>
                <span>Im Rucksack</span>
                <b>
                  {count}
                  <small> Gegenstände</small>
                </b>
              </div>
            </section>
          </div>
          <section className="card inventory-card">
            <div className="inventory-toolbar">
              <label className="search-field">
                <Search size={17} />
                <input
                  aria-label="Gegenstände durchsuchen"
                  placeholder="Gegenstände durchsuchen …"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Gegenstandskategorie filtern"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>Alle</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            {!items.length ? (
              <Empty>
                {query || filter !== "Alle"
                  ? "Keine passenden Gegenstände gefunden."
                  : "Dein Rucksack wartet auf die ersten Schätze."}
              </Empty>
            ) : (
              <div className="item-list">
                {items.map((item) => (
                  <div className="item-row" key={item.id}>
                    <span
                      className={
                        "item-icon " + (item.equipped ? "equipped" : "")
                      }
                    >
                      <ItemIcon category={item.category} />
                    </span>
                    <button
                      className="item-description"
                      onClick={() => setDraft(structuredClone(item))}
                    >
                      <strong>
                        {item.name}
                        {item.equipped && (
                          <span className="badge green">Ausgerüstet</span>
                        )}
                      </strong>
                      <span>
                        {item.category} · {item.weight.toLocaleString("de-DE")}{" "}
                        kg / Stück
                      </span>
                      <p>{item.description}</p>
                    </button>
                    <div className="quantity-controls">
                      <button
                        className="icon-button"
                        aria-label={item.name + " Anzahl verringern"}
                        disabled={item.quantity === 0}
                        onClick={() =>
                          update((c) => ({
                            ...c,
                            inventory: c.inventory.map((i) =>
                              i.id === item.id
                                ? {
                                    ...i,
                                    quantity: clamp(i.quantity - 1, 0, 10000),
                                  }
                                : i,
                            ),
                          }))
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className="icon-button"
                        aria-label={item.name + " Anzahl erhöhen"}
                        disabled={item.quantity >= 10000}
                        onClick={() =>
                          update((c) => ({
                            ...c,
                            inventory: c.inventory.map((i) =>
                              i.id === item.id
                                ? {
                                    ...i,
                                    quantity: clamp(i.quantity + 1, 0, 10000),
                                  }
                                : i,
                            ),
                          }))
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className={
                        "icon-button equip-toggle" +
                        (item.equipped ? " is-equipped" : "")
                      }
                      title={item.equipped ? "Ablegen" : "Ausrüsten"}
                      aria-label={
                        item.name + (item.equipped ? " ablegen" : " ausrüsten")
                      }
                      aria-pressed={item.equipped}
                      onClick={() =>
                        update((c) => ({
                          ...c,
                          inventory: c.inventory.map((i) =>
                            i.id === item.id
                              ? { ...i, equipped: !i.equipped }
                              : i,
                          ),
                        }))
                      }
                    >
                      <Check size={18} />
                    </button>
                    <button
                      className="icon-button delete-item"
                      title="Gegenstand entfernen"
                      aria-label={item.name + " entfernen"}
                      onClick={() =>
                        update((c) => ({
                          ...c,
                          inventory: c.inventory.filter(
                            (i) => i.id !== item.id,
                          ),
                        }))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="inventory-footer">
              {items.length} Einträge · Änderungen werden automatisch
              gespeichert.
              <span>
                Gewicht ist informativ; Traglast wird noch nicht geprüft.
              </span>
            </div>
          </section>
        </>
      )}
      {draft && (
        <Modal
          title={
            character?.inventory.some((i) => i.id === draft.id)
              ? "Gegenstand bearbeiten"
              : "Neuer Gegenstand"
          }
          onClose={() => setDraft(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const item = {
                ...draft,
                name: draft.name.trim() || "Gegenstand",
              };
              update((c) => ({
                ...c,
                inventory: c.inventory.some((i) => i.id === item.id)
                  ? c.inventory.map((i) => (i.id === item.id ? item : i))
                  : [...c.inventory, item],
              }));
              setDraft(null);
            }}
          >
            <label className="field">
              Name
              <input
                autoFocus
                required
                maxLength={100}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <div className="form-grid">
              <label className="field">
                Kategorie
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Anzahl
                <input
                  required
                  type="number"
                  min={0}
                  max={10000}
                  value={draft.quantity}
                  onChange={(e) =>
                    setDraft({ ...draft, quantity: Number(e.target.value) })
                  }
                />
              </label>
              <label className="field">
                Gewicht je Stück (kg)
                <input
                  required
                  type="number"
                  min={0}
                  max={10000}
                  step=".001"
                  value={draft.weight}
                  onChange={(e) =>
                    setDraft({ ...draft, weight: Number(e.target.value) })
                  }
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={draft.equipped}
                  onChange={(e) =>
                    setDraft({ ...draft, equipped: e.target.checked })
                  }
                />
                Ausgerüstet
              </label>
            </div>
            <label className="field">
              Beschreibung
              <textarea
                rows={3}
                maxLength={5000}
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
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
