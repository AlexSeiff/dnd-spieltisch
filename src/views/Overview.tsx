import {
  ArrowRight,
  ArrowUpRight,
  Swords,
  Users,
  Dices,
  Map,
  BookOpen,
  ChevronRight,
  Flame,
  Sparkles,
} from "lucide-react";
import type { CampaignState, View, Role } from "../domain/types";
import { orderParticipants } from "../domain/rules";
import { Avatar, HpBar, D20, timeLabel } from "../components/ui";
import { BattleMap } from "../components/BattleMap";

export function Overview({
  state,
  navigate,
  role,
  openCharacter,
}: {
  state: CampaignState;
  navigate: (view: View) => void;
  role: Role;
  openCharacter: (id: string) => void;
}) {
  const current = state.combat.participants.find(
    (p) => p.id === state.combat.activeId,
  );
  const recent = state.rolls
    .filter((r) => role === "gm" || !r.secret)
    .slice(0, 3);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DEIN ABENTEUER BEGINNT HIER</div>
          <h1>
            Am Spieltisch<span className="heading-dot">.</span>
          </h1>
          <p>Die Geschichte gehört euch. Den Überblick behalten wir.</p>
        </div>
        <span className="session-label">
          <span className="status-dot" />
          Sitzung {String(state.campaign.session).padStart(2, "0")}
        </span>
      </div>
      <div className="overview-top">
        <section className="campaign-hero">
          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 700 340" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern
                  id="contour"
                  width="140"
                  height="100"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M-30 50Q30-20 100 20T180 70M-40 70Q30 0 100 40T180 90M-50 90Q30 20 100 60T180 110"
                    fill="none"
                    stroke="#b2d19c"
                    strokeOpacity=".11"
                  />
                </pattern>
              </defs>
              <rect width="700" height="340" fill="url(#contour)" />
              <g fill="#263f34" stroke="#8eaa7d" strokeOpacity=".35">
                <path d="M490 310V160h30v-40h20v40h30v150M530 310V85l20-30 20 30v225M565 310V175h25v-30h20v30h25v135" />
                <path d="M450 310v-75h20v-20h20v95M620 310v-110h35v110" />
              </g>
              <circle
                cx="550"
                cy="100"
                r="81"
                stroke="#abc99b"
                strokeOpacity=".15"
                fill="none"
              />
              <circle
                cx="550"
                cy="100"
                r="105"
                stroke="#abc99b"
                strokeOpacity=".08"
                fill="none"
              />
              <path d="m538 310 13-84 14 84" fill="#b2c795" opacity=".2" />
            </svg>
          </div>
          <div className="hero-content">
            <span className="hero-kicker">
              <Flame size={14} />
              AKTUELLE KAMPAGNE
            </span>
            <h2>{state.campaign.name}</h2>
            <p>Kapitel 01 · {state.campaign.chapter}</p>
            <div className="hero-bottom">
              <button
                className="button primary"
                onClick={() => navigate("combat")}
              >
                Zum Abenteuer
                <ArrowRight size={17} />
              </button>
              <span className="hero-party">
                <span className="avatar-stack">
                  {state.characters.slice(0, 3).map((c) => (
                    <Avatar key={c.id} name={c.name} color={c.color} small />
                  ))}
                </span>
                {state.characters.length} Helden sind dabei
              </span>
            </div>
          </div>
        </section>
        <section className="card party-card">
          <div className="card-heading">
            <h2>
              <Users size={18} />
              Die Gruppe
            </h2>
            <button
              className="icon-button"
              aria-label="Alle Charaktere öffnen"
              onClick={() => navigate("characters")}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="party-list">
            {state.characters.slice(0, 4).map((c) => (
              <button
                className="party-row"
                key={c.id}
                onClick={() => openCharacter(c.id)}
              >
                <Avatar name={c.name} color={c.color} />
                <div className="party-info">
                  <strong>{c.name}</strong>
                  <span>
                    {c.className} · Stufe {c.level}
                  </span>
                  <HpBar hp={c.hp} maxHp={c.maxHp} />
                </div>
                <div className="party-hp">
                  <strong>
                    {c.hp}
                    <small>/{c.maxHp}</small>
                  </strong>
                  <span>TP</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="quick-actions">
        {[
          {
            view: "dice" as View,
            icon: Dices,
            label: "Lass die Würfel rollen",
            sub: "W20, Vorteil & freie Formeln",
            color: "sage",
          },
          {
            view: "characters" as View,
            icon: Users,
            label: "Deine Helden",
            sub: "Werte, Fähigkeiten & Notizen",
            color: "violet",
          },
          {
            view: "inventory" as View,
            icon: Sparkles,
            label: "Gut ausgerüstet",
            sub: "Ausrüstung & gefundene Schätze",
            color: "amber",
          },
        ].map((a) => (
          <button
            key={a.view}
            className="quick-action"
            onClick={() => navigate(a.view)}
          >
            <span className={"action-icon " + a.color}>
              <a.icon size={21} />
            </span>
            <span>
              <strong>{a.label}</strong>
              <small>{a.sub}</small>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
      <div className="overview-bottom">
        <section className="card encounter-card">
          <div className="card-heading">
            <h2>
              <Swords size={18} />
              Aktuelle Begegnung
            </h2>
            <span className={"badge " + (state.combat.started ? "green" : "")}>
              {state.combat.started
                ? "Runde " + state.combat.round
                : "Vorbereitet"}
            </span>
          </div>
          <div className="encounter-title">
            <span className="eyebrow">
              {state.combat.started
                ? "DAS GEFECHT IST IM GANGE"
                : "BEREIT FÜR DIE NÄCHSTE BEGEGNUNG"}
            </span>
            <h3>{state.combat.name}</h3>
            <p>
              {current
                ? current.name + " ist am Zug."
                : state.combat.participants.filter(
                    (p) => p.kind === "monster" && p.hp > 0,
                  ).length + " Gegner warten auf die Gruppe."}
            </p>
          </div>
          <div className="initiative-mini">
            {orderParticipants(state.combat.participants)
              .slice(0, 5)
              .map((p) => (
                <div
                  key={p.id}
                  className={state.combat.activeId === p.id ? "current" : ""}
                >
                  <span className="initiative-number">{p.initiative}</span>
                  <Avatar
                    name={p.name}
                    color={p.color}
                    monster={p.kind === "monster"}
                    small
                  />
                  <span>{p.name}</span>
                  {p.kind === "hero" && (
                    <small>
                      {p.hp} / {p.maxHp} TP
                    </small>
                  )}
                  {state.combat.activeId === p.id && (
                    <span className="turn-dot" />
                  )}
                </div>
              ))}
          </div>
          <button className="card-link" onClick={() => navigate("combat")}>
            Kampfübersicht öffnen
            <ArrowRight size={16} />
          </button>
        </section>
        <section className="card overview-map">
          <div className="card-heading">
            <h2>
              <Map size={18} />
              Auf der Karte
            </h2>
            <button
              className="icon-button"
              aria-label="Karte öffnen"
              onClick={() => navigate("map")}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          <button
            className="map-preview-button"
            aria-label="Karte der alten Brücke öffnen"
            onClick={() => navigate("map")}
          >
            <BattleMap state={state} compact />
          </button>
          <div className="map-preview-caption">
            <span>
              <strong>Die alte Brücke</strong>
              <small>Begegnungskarte · 12 × 10 Felder</small>
            </span>
            <span className="badge">1,5 m</span>
          </div>
        </section>
        <section className="card recent-card">
          <div className="card-heading">
            <h2>
              <Dices size={18} />
              Letzte Würfe
            </h2>
            <button
              className="icon-button"
              aria-label="Würfelraum öffnen"
              onClick={() => navigate("dice")}
            >
              <ArrowUpRight size={18} />
            </button>
          </div>
          {recent.length ? (
            <div className="recent-rolls">
              {recent.map((r) => (
                <div className="recent-roll" key={r.id}>
                  <span className="roll-mini">
                    <D20 size={27} />
                  </span>
                  <div>
                    <strong>{r.label || r.formula}</strong>
                    <small>
                      {r.formula} · {timeLabel(r.time)}
                    </small>
                  </div>
                  <b>{r.total}</b>
                </div>
              ))}
            </div>
          ) : (
            <div className="dice-empty">
              <D20 size={48} />
              <strong>Das Schicksal wartet.</strong>
              <p>Dein erster Wurf schreibt Geschichte.</p>
              <button
                className="button subtle small-button"
                onClick={() => navigate("dice")}
              >
                Würfelraum öffnen
                <ArrowRight size={14} />
              </button>
            </div>
          )}
          <button
            className="journal-teaser"
            onClick={() => navigate("journal")}
          >
            <BookOpen size={17} />
            <span>Sitzungsnotizen</span>
            <ChevronRight size={15} />
          </button>
        </section>
      </div>
      <div className="overview-foot">
        <span className="status-dot" />
        Dein Spielstand bleibt auf diesem Gerät.
        <button onClick={() => navigate("journal")}>
          Kampagne verwalten
          <ArrowRight size={13} />
        </button>
      </div>
    </>
  );
}
