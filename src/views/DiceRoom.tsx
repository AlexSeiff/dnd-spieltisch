import { useEffect, useRef, useState } from "react";
import { Dices, LockKeyhole, Sparkles, History } from "lucide-react";
import type { CampaignState, DiceResult, Role } from "../domain/types";
import { D20, Empty, timeLabel } from "../components/ui";
import { signed, naturalD20 } from "../domain/rules";
import { DiceTray } from "../components/DiceTray";

export type Roll = (
  formula: string,
  label?: string,
  mode?: DiceResult["mode"],
  secret?: boolean,
) => void;
export function DiceRoom({
  state,
  role,
  roll,
  pendingRoll,
}: {
  state: CampaignState;
  role: Role;
  roll: Roll;
  pendingRoll?: DiceResult | null;
}) {
  const [formula, setFormula] = useState("1d20");
  const [mode, setMode] = useState<DiceResult["mode"]>("normal");
  const [secret, setSecret] = useState(false);
  const [label, setLabel] = useState("");
  const history = state.rolls.filter((r) => role === "gm" || !r.secret);
  const resultRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!pendingRoll) return;
    const element = resultRef.current;
    if (
      element &&
      (element.getBoundingClientRect().top < 70 ||
        element.getBoundingClientRect().bottom > window.innerHeight)
    )
      element.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
  }, [pendingRoll?.id]);
  const rolling = !!pendingRoll;
  const last = pendingRoll || history[0];
  const natural = last ? naturalD20(last) : null;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">EIN WURF. TAUSEND MÖGLICHKEITEN.</div>
          <h1>
            Würfelraum<span className="heading-dot">.</span>
          </h1>
          <p>
            Ob kritischer Treffer oder großes Pech – lass das Schicksal
            entscheiden.
          </p>
        </div>
        <span className="badge">{history.length} Würfe im Verlauf</span>
      </div>
      <div className="dice-layout">
        <section className="card dice-console">
          <div className="card-heading">
            <h2>
              <Dices size={18} />
              Dein nächster Wurf
            </h2>
            <span className="badge green">Bereit</span>
          </div>
          <div className="dice-picker">
            {[4, 6, 8, 10, 12, 20, 100].map((n) => (
              <button
                key={n}
                className={formula === "1d" + n ? "selected" : ""}
                onClick={() => {
                  setFormula("1d" + n);
                  setMode("normal");
                }}
              >
                <D20 size={n === 20 ? 38 : 30} />
                <span>W{n}</span>
              </button>
            ))}
          </div>
          <form
            className="dice-form"
            onSubmit={(e) => {
              e.preventDefault();
              roll(formula, label.trim(), mode, role === "gm" && secret);
            }}
          >
            <label className="field">
              Würfelformel
              <input
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="z. B. 2d6+3"
                required
                maxLength={40}
                spellCheck={false}
              />
              <small>W und d sind möglich · bis zu 100 Würfel</small>
            </label>
            <div className="segmented" aria-label="Würfelmodus">
              {(
                [
                  ["normal", "Normal"],
                  ["advantage", "Vorteil"],
                  ["disadvantage", "Nachteil"],
                ] as const
              ).map(([value, title]) => (
                <button
                  key={value}
                  type="button"
                  className={mode === value ? "active" : ""}
                  aria-pressed={mode === value}
                  onClick={() => {
                    setMode(value);
                    if (
                      value !== "normal" &&
                      !/^1?[dw]20([+-]\d+)?$/i.test(formula.replace(/\s/g, ""))
                    )
                      setFormula("1d20");
                  }}
                >
                  {title}
                </button>
              ))}
            </div>
            <label className="field">
              Bezeichnung <span className="optional">optional</span>
              <input
                value={label}
                maxLength={100}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="z. B. Angriff mit Langbogen"
              />
            </label>
            {role === "gm" && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={secret}
                  onChange={(e) => setSecret(e.target.checked)}
                />
                <LockKeyhole size={15} />
                Geheimer SL-Wurf
              </label>
            )}
            <button
              className="button primary roll-button"
              type="submit"
              disabled={rolling}
            >
              <Dices size={21} />
              {rolling ? "Die Würfel rollen …" : "Jetzt würfeln"}
              <Sparkles size={17} />
            </button>
          </form>
        </section>
        <section
          ref={resultRef}
          className={
            "card dice-result-card" +
            (natural === 20 && !rolling
              ? " critical"
              : natural === 1 && !rolling
                ? " fumble"
                : "")
          }
          aria-busy={rolling}
        >
          <span className="eyebrow">
            {rolling
              ? "EIN AUGENBLICK FÜR DAS SCHICKSAL"
              : "DAS SCHICKSAL HAT GESPROCHEN"}
          </span>
          <DiceTray result={last || null} rolling={rolling} />
          <div className="dice-total" aria-live="polite">
            <span>GESAMTERGEBNIS</span>
            <strong key={rolling ? "rolling" : last?.id}>
              {rolling ? "…" : last ? last.total : "–"}
            </strong>
          </div>
          <h2>
            {last?.label ||
              (last ? "Dein Würfelergebnis" : "Bereit für dein Abenteuer?")}
          </h2>
          <p>
            {last
              ? last.formula +
                (last.mode === "advantage"
                  ? " · Vorteil"
                  : last.mode === "disadvantage"
                    ? " · Nachteil"
                    : "")
              : "Wähle einen Würfel oder gib eine Formel ein."}
          </p>
          {last && !rolling && (
            <div className="roll-breakdown">
              {last.rolls.map((r, i) => (
                <span
                  key={i}
                  className={
                    last.mode !== "normal" && r !== last.total - last.modifier
                      ? "discarded"
                      : ""
                  }
                >
                  {r}
                </span>
              ))}
              {last.modifier !== 0 && <b>{signed(last.modifier)}</b>}
              <span className="equals">=</span>
              <b>{last.total}</b>
            </div>
          )}
          <button
            className="button subtle dice-repeat"
            disabled={rolling}
            onClick={() =>
              last
                ? roll(last.formula, last.label, last.mode, last.secret)
                : roll(formula, label.trim(), mode, role === "gm" && secret)
            }
          >
            <Dices size={15} />
            {rolling
              ? "Die Würfel rollen …"
              : last
                ? "Noch einmal würfeln"
                : "Würfel werfen"}
          </button>
        </section>
      </div>
      <section className="card history-card">
        <div className="card-heading">
          <h2>
            <History size={18} />
            Würfelverlauf
          </h2>
          <span className="muted">Letzte 100 Würfe · lokal gespeichert</span>
        </div>
        {!history.length ? (
          <Empty>
            Hier erscheinen deine Würfe mit allen Einzelergebnissen.
          </Empty>
        ) : (
          <div className="roll-history">
            {history.map((r) => (
              <div className="history-row" key={r.id}>
                <span className="roll-mini">
                  <D20 size={25} />
                </span>
                <div className="history-label">
                  <strong>
                    {r.label || "Freier Wurf"}
                    {r.secret && (
                      <LockKeyhole size={13} aria-label="Geheimer Wurf" />
                    )}
                  </strong>
                  <small>
                    {r.formula}
                    {r.mode !== "normal" &&
                      " · " +
                        (r.mode === "advantage" ? "Vorteil" : "Nachteil")}{" "}
                    · [{r.rolls.join(", ")}]
                    {r.modifier ? " " + signed(r.modifier) : ""}
                  </small>
                </div>
                <time>{timeLabel(r.time)}</time>
                <b className="history-total">{r.total}</b>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
