import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Dices,
  Backpack,
  Swords,
  Map,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Undo2,
  Check,
  AlertCircle,
  X,
  Laptop,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import type { CampaignState, DiceResult, Role, View } from "./domain/types";
import { rollDice, uid, timestamp } from "./domain/rules";
import { parseCampaign, MAX_IMPORT_SIZE } from "./domain/storage";
import { useCampaign } from "./hooks/useCampaign";
import { D20, Modal } from "./components/ui";
import { DiceTray, ROLL_DURATION } from "./components/DiceTray";
import { Journal } from "./views/Journal";
import { Atlas } from "./views/Atlas";
import { Overview } from "./views/Overview";
import { Characters } from "./views/Characters";
import { DiceRoom } from "./views/DiceRoom";
import type { Roll } from "./views/DiceRoom";
import { Inventory } from "./views/Inventory";
import { CombatView } from "./views/Combat";

const navigation = [
  { id: "overview" as View, label: "Übersicht", icon: LayoutDashboard },
  { id: "characters" as View, label: "Charaktere", icon: Users },
  { id: "dice" as View, label: "Würfelraum", icon: Dices },
  { id: "inventory" as View, label: "Inventar", icon: Backpack },
  { id: "combat" as View, label: "Kampf", icon: Swords },
  { id: "map" as View, label: "Karten", icon: Map },
];
export default function App() {
  const { state, change, undo, canUndo, replace, error } = useCampaign();
  const [view, setView] = useState<View>("overview");
  const [role, setRole] = useState<Role>("gm");
  const [selectedId, setSelectedId] = useState(state.characters[0]?.id || "");
  const [ownSelection, setOwnSelection] = useState(
    state.characters[0]?.id || "",
  );
  const [notice, setNotice] = useState("");
  const [pendingRoll, setPendingRoll] = useState<DiceResult | null>(null);
  const rollTimer = useRef<number | null>(null);
  const roleRef = useRef(role);
  roleRef.current = role;
  const visiblePending =
    pendingRoll && (role === "gm" || !pendingRoll.secret) ? pendingRoll : null;
  useEffect(
    () => () => {
      if (rollTimer.current !== null) window.clearTimeout(rollTimer.current);
    },
    [],
  );
  const [importPreview, setImportPreview] = useState<CampaignState | null>(
    null,
  );
  const importRef = useRef<HTMLInputElement>(null);
  const ownId =
    state.characters.find((c) => c.id === ownSelection)?.id ||
    state.characters[0]?.id ||
    "";
  const activeLabel =
    navigation.find((n) => n.id === view)?.label || "Sitzungsnotizen";
  useEffect(() => {
    if (notice) {
      const timer = window.setTimeout(() => setNotice(""), 6500);
      return () => window.clearTimeout(timer);
    }
  }, [notice]);
  const roll: Roll = (formula, label = "", mode = "normal", secret = false) => {
    if (rollTimer.current !== null) return;
    try {
      const result: DiceResult = {
        ...rollDice(formula, mode),
        id: uid(),
        label,
        secret: role === "gm" && secret,
        time: timestamp(),
      };
      setNotice("");
      setPendingRoll(result);
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? 120
        : ROLL_DURATION;
      rollTimer.current = window.setTimeout(() => {
        change((s) => ({ ...s, rolls: [result, ...s.rolls].slice(0, 100) }));
        setPendingRoll(null);
        rollTimer.current = null;
        if (!result.secret || roleRef.current === "gm")
          setNotice(
            (label ? label + ": " : "") +
              result.total +
              " gewürfelt (" +
              result.formula +
              ").",
          );
      }, duration);
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : "Der Wurf konnte nicht ausgeführt werden.",
      );
    }
  };
  function exportCampaign() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download =
      "wuerfelwerk-" + new Date().toISOString().slice(0, 10) + ".json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Spielstand als JSON exportiert.");
  }
  async function importCampaign(file?: File) {
    if (!file) return;
    if (rollTimer.current !== null) {
      setNotice("Bitte den laufenden Wurf abwarten.");
      return;
    }
    try {
      if (file.size > MAX_IMPORT_SIZE)
        throw new Error("Die Datei ist zu groß. Maximal 16 MB sind erlaubt.");
      setImportPreview(parseCampaign(await file.text()));
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Der Import ist fehlgeschlagen.",
      );
    }
  }
  function navigate(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function navigateFromOverview(next: View) {
    if (next === "map")
      change((s) => ({
        ...s,
        atlas: { activeMapId: "bridge", images: s.atlas?.images || {} },
      }));
    navigate(next);
  }
  function openCharacter(id: string) {
    setSelectedId(id);
    if (role === "player") setOwnSelection(id);
    navigate("characters");
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          aria-label="Würfelwerk Übersicht"
          onClick={() => navigate("overview")}
        >
          <span className="brand-mark">
            <D20 size={32} />
          </span>
          <span>
            Würfelwerk<small>DEIN DIGITALER SPIELTISCH</small>
          </span>
        </button>
        <div className="sidebar-campaign">
          <span className="eyebrow">DEINE KAMPAGNE</span>
          <button onClick={() => navigate("journal")}>
            <span className="campaign-initial">E</span>
            <span>{state.campaign.name}</span>
            <ChevronDown size={14} />
          </button>
          <span className="campaign-state">
            <span className="status-dot" />
            {state.combat.started
              ? "Kampf läuft · Runde " + state.combat.round
              : "Abenteuer in Vorbereitung"}
          </span>
        </div>
        <div className="nav-section-label">AM SPIELTISCH</div>
        <nav aria-label="Hauptnavigation">
          {navigation.map((n) => (
            <button
              key={n.id}
              className={"nav-item" + (view === n.id ? " active" : "")}
              aria-current={view === n.id ? "page" : undefined}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {view === n.id && <span className="nav-active-dot" />}
              {n.id === "characters" && view !== n.id && (
                <small>{state.characters.length}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={"nav-item" + (view === "journal" ? " active" : "")}
            onClick={() => navigate("journal")}
          >
            <BookOpen size={18} />
            <span>Sitzungsnotizen</span>
          </button>
          <div className="local-note">
            <Laptop size={17} />
            <div>
              <strong>Euer Tisch. Eure Geschichte.</strong>
              <span>Lokaler Prototyp · v0.1</span>
            </div>
          </div>
          <div className="sidebar-signature">MIT FANTASIE GESPIELT.</div>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Spieltisch</span>
            <ChevronRight size={13} />
            <strong>{activeLabel}</strong>
          </div>
          <div className="topbar-actions">
            <span className={"saved-indicator" + (error ? " save-error" : "")}>
              {error ? <AlertCircle size={14} /> : <Check size={14} />}
              <span>{error ? "Speicherhinweis" : "Lokal gespeichert"}</span>
            </span>
            <div className="topbar-divider" />
            <label className="role-select">
              <ShieldCheck size={16} />
              <select
                aria-label="Ansicht wählen"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as Role);
                  setNotice("");
                }}
              >
                <option value="gm">Spielleiter</option>
                <option value="player">Spieler</option>
              </select>
            </label>
            {role === "player" && (
              <select
                className="own-character-select"
                aria-label="Eigenen Charakter wählen"
                value={ownId}
                onChange={(e) => {
                  setOwnSelection(e.target.value);
                  setSelectedId(e.target.value);
                }}
              >
                {state.characters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <button
              className="icon-button"
              disabled={!canUndo || !!pendingRoll}
              title="Letzte Änderung rückgängig machen"
              aria-label="Letzte Änderung rückgängig machen"
              onClick={() => {
                undo();
                setNotice("Letzte Änderung zurückgenommen.");
              }}
            >
              <Undo2 size={18} />
            </button>
            {role === "gm" && (
              <>
                <button
                  className="icon-button"
                  aria-label="Spielstand importieren"
                  title="Spielstand importieren"
                  onClick={() => importRef.current?.click()}
                >
                  <Upload size={18} />
                </button>
                <button
                  className="button subtle small-button export-button"
                  aria-label="Spielstand exportieren"
                  title="Spielstand exportieren"
                  onClick={exportCampaign}
                >
                  <Download size={15} />
                  <span>Exportieren</span>
                </button>
              </>
            )}
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button
                className="button subtle small-button"
                onClick={exportCampaign}
              >
                Sicherung exportieren
              </button>
            </div>
          )}
          {role === "player" && (
            <div className="role-preview">
              <ShieldCheck size={14} />
              Lokale Spieleransicht · Rollen dienen hier zur Vorschau.
              Online-Zugriffsrechte folgen später.
            </div>
          )}
          {view === "overview" && (
            <Overview
              state={state}
              navigate={navigateFromOverview}
              role={role}
              openCharacter={openCharacter}
            />
          )}
          {view === "characters" && (
            <Characters
              state={state}
              change={change}
              selectedId={selectedId}
              select={setSelectedId}
              role={role}
              ownId={ownId}
              roll={roll}
            />
          )}
          {view === "dice" && (
            <DiceRoom
              state={state}
              role={role}
              roll={roll}
              pendingRoll={visiblePending}
            />
          )}
          {view === "inventory" && (
            <Inventory
              state={state}
              change={change}
              selectedId={selectedId}
              select={setSelectedId}
              role={role}
              ownId={ownId}
            />
          )}
          {view === "combat" && (
            <CombatView
              state={state}
              change={change}
              role={role}
              ownId={ownId}
            />
          )}
          {view === "map" && (
            <Atlas
              state={state}
              change={change}
              role={role}
              ownId={ownId}
              notify={setNotice}
            />
          )}
          {view === "journal" && (
            <Journal
              state={state}
              change={change}
              role={role}
              exportCampaign={exportCampaign}
              openImport={() => importRef.current?.click()}
            />
          )}
        </main>
        <footer className="app-footer">
          <span>
            <D20 size={17} />
            Würfelwerk
          </span>
          <span>Weniger verwalten. Mehr Abenteuer.</span>
          <button onClick={() => navigate("journal")}>
            Lokaler Spielstand
            <ArrowUpRight size={13} />
          </button>
        </footer>
      </div>
      {visiblePending && view !== "dice" && (
        <div className="floating-roll" role="status">
          <span>{visiblePending.label || "Die Würfel rollen …"}</span>
          <DiceTray result={visiblePending} rolling />
        </div>
      )}
      <input
        type="file"
        ref={importRef}
        hidden
        accept=".json,application/json"
        onChange={(e) => {
          void importCampaign(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {notice && (
        <div className="toast" role="status">
          <D20 size={23} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Hinweis schließen"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {importPreview && (
        <Modal
          title="Spielstand importieren"
          onClose={() => setImportPreview(null)}
        >
          <div className="import-summary">
            <BookOpen size={28} />
            <h3>{importPreview.campaign.name}</h3>
            <p>
              {importPreview.characters.length} Charaktere ·{" "}
              {importPreview.combat.participants.length} Kampfteilnehmer ·
              Sitzung {importPreview.campaign.session}
            </p>
            <p>
              Dieser Spielstand ersetzt den aktuellen Stand. Du kannst den
              Import anschließend über Rückgängig zurücknehmen.
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="button ghost"
              onClick={() => setImportPreview(null)}
            >
              Abbrechen
            </button>
            <button
              className="button primary"
              onClick={() => {
                replace(importPreview);
                setSelectedId(importPreview.characters[0]?.id || "");
                setImportPreview(null);
                setNotice("Spielstand erfolgreich importiert.");
              }}
            >
              <Check size={16} />
              Spielstand übernehmen
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
