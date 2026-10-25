import { useRef, useState } from "react";
import { Grid2X2, Upload, RotateCcw, Move, Compass } from "lucide-react";
import type { CampaignState, Role } from "../domain/types";
import { clamp } from "../domain/rules";
import { Avatar } from "./ui";
import type { Change } from "./ui";

function Terrain() {
  return (
    <svg
      className="terrain"
      viewBox="0 0 1200 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="stones"
          width="80"
          height="65"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 0h80v65H0z M0 32h40v33M40 0v32h40"
            fill="none"
            stroke="#83917a"
            strokeOpacity=".1"
          />
        </pattern>
        <filter id="blur">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="1200" height="1000" fill="#25352e" />
      <path
        d="M-100 160Q260 180 320 460T570 1100H930Q540 550 650 400T450-100Z"
        fill="#284344"
      />
      <path
        d="M-100 185Q235 205 298 470T550 1100M470-100Q665 220 625 430T900 1100"
        fill="none"
        stroke="#7aa5a0"
        strokeOpacity=".16"
        strokeWidth="13"
      />
      <g fill="none" stroke="#92b5aa" strokeWidth="2" opacity=".15">
        <path d="m290 280 70 30m75 85 60 25m-20 180 75 35m55 135 60 35m-140-270 80 35m110 190 70 35" />
      </g>
      <path
        d="m250 630 500-330 123 180-500 330Z"
        fill="#5f6651"
        stroke="#1b2722"
        strokeWidth="18"
      />
      <path d="m250 630 500-330 123 180-500 330Z" fill="url(#stones)" />
      <path
        d="m250 620 500-330M380 820l500-330"
        fill="none"
        stroke="#8c8c6a"
        strokeWidth="22"
      />
      <path
        d="m225 623 45-30 30 48-45 30zm510-337 45-28 30 48-45 28zm-375 510 45-30 30 48-45 30zm490-310 45-28 30 48-45 28z"
        fill="#989371"
      />
      <g fill="#1b2c23" stroke="#334b34" strokeWidth="8">
        <circle cx="70" cy="760" r="100" />
        <circle cx="140" cy="870" r="78" />
        <circle cx="70" cy="950" r="70" />
        <circle cx="1020" cy="100" r="110" />
        <circle cx="1150" cy="200" r="100" />
        <circle cx="1100" cy="20" r="90" />
        <circle cx="1090" cy="850" r="80" />
      </g>
      <g fill="#3d5137" opacity=".5">
        <circle cx="60" cy="750" r="58" />
        <circle cx="140" cy="870" r="40" />
        <circle cx="1030" cy="100" r="60" />
        <circle cx="1150" cy="195" r="50" />
        <circle cx="1095" cy="850" r="43" />
      </g>
      <path
        d="M830 790v-95h230v-80M860 860h150v-90M80 160V80h130v150"
        fill="none"
        stroke="#69705a"
        strokeWidth="35"
      />
      <path
        d="M830 790v-95h230v-80M860 860h150v-90M80 160V80h130v150"
        fill="none"
        stroke="#929077"
        strokeWidth="21"
        strokeDasharray="43 3"
      />
      <g fill="#68715b">
        <ellipse cx="180" cy="430" rx="23" ry="17" />
        <ellipse cx="890" cy="580" rx="31" ry="21" />
        <ellipse cx="720" cy="830" rx="18" ry="12" />
        <ellipse cx="540" cy="150" rx="22" ry="12" />
      </g>
    </svg>
  );
}
export function BattleMap({
  state,
  change,
  role = "gm",
  ownId,
  compact = false,
  notify,
}: {
  state: CampaignState;
  change?: Change;
  role?: Role;
  ownId?: string;
  compact?: boolean;
  notify?: (message: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const moveToken = (id: string, x: number, y: number) =>
    change?.((s) => ({
      ...s,
      combat: {
        ...s.combat,
        participants: s.combat.participants.map((p) =>
          p.id === id ? { ...p, x: clamp(x, 0, 11), y: clamp(y, 0, 9) } : p,
        ),
      },
    }));
  async function importImage(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2_000_000
    ) {
      notify?.("Bitte ein PNG-, JPG- oder WebP-Bild bis 2 MB auswählen.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      change?.((s) => ({
        ...s,
        map: { ...s.map, image: String(reader.result) },
      }));
      notify?.("Karte geladen und lokal gespeichert.");
    };
    reader.onerror = () =>
      notify?.("Das Kartenbild konnte nicht gelesen werden.");
    reader.readAsDataURL(file);
  }
  return (
    <div className={"map-module" + (compact ? " compact" : "")}>
      {!compact && (
        <div className="map-toolbar">
          <div className="muted flex">
            <Compass size={16} />
            <span>Alte Brücke · 12 × 10 Felder · 1,5 m / Feld</span>
          </div>
          <div className="button-group">
            <button
              className={
                "button small-button " + (state.map.grid ? "subtle" : "ghost")
              }
              aria-pressed={state.map.grid}
              onClick={() =>
                change?.((s) => ({
                  ...s,
                  map: { ...s.map, grid: !s.map.grid },
                }))
              }
            >
              <Grid2X2 size={16} />
              Raster
            </button>
            {role === "gm" && (
              <>
                <button
                  className="button small-button subtle"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload size={16} />
                  Karte laden
                </button>
                {state.map.image && (
                  <button
                    className="icon-button"
                    aria-label="Beispielkarte wiederherstellen"
                    onClick={() =>
                      change?.((s) => ({
                        ...s,
                        map: { ...s.map, image: null },
                      }))
                    }
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                void importImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}
      <div
        className={
          "battlefield" +
          (state.map.grid ? " show-grid" : "") +
          (selected && !compact ? " placing" : "")
        }
        onClick={(e) => {
          if (!selected || compact) return;
          const token = state.combat.participants.find(
            (p) => p.id === selected,
          );
          if (!token || (role === "player" && token.characterId !== ownId))
            return;
          const rect = e.currentTarget.getBoundingClientRect();
          moveToken(
            selected,
            Math.floor(((e.clientX - rect.left) / rect.width) * 12),
            Math.floor(((e.clientY - rect.top) / rect.height) * 10),
          );
        }}
      >
        {state.map.image ? (
          <img
            className="terrain"
            src={state.map.image}
            alt="Importierte Kampfkarte"
          />
        ) : (
          <Terrain />
        )}
        <div className="map-grid" />
        <span className="north">
          N<span>↑</span>
        </span>
        <span className="map-caption">DIE ALTE BRÜCKE</span>
        {state.combat.participants
          .filter((p) => p.hp > 0 || p.kind === "hero")
          .map((p) =>
            compact ? (
              <span
                key={p.id}
                className={"map-token static " + p.color}
                style={{
                  left: ((p.x + 0.5) / 12) * 100 + "%",
                  top: ((p.y + 0.5) / 10) * 100 + "%",
                }}
              >
                <Avatar
                  name={p.name}
                  color={p.color}
                  monster={p.kind === "monster"}
                  small
                />
              </span>
            ) : (
              <button
                key={p.id}
                className={
                  "map-token " +
                  p.color +
                  (selected === p.id ? " selected" : "") +
                  (state.combat.activeId === p.id ? " active-token" : "")
                }
                style={{
                  left: ((p.x + 0.5) / 12) * 100 + "%",
                  top: ((p.y + 0.5) / 10) * 100 + "%",
                }}
                title={p.name}
                aria-label={p.name + ", Feld " + (p.x + 1) + "/" + (p.y + 1)}
                aria-pressed={selected === p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (role === "gm" || p.characterId === ownId)
                    setSelected(selected === p.id ? null : p.id);
                }}
                onKeyDown={(e) => {
                  if (role !== "gm" && p.characterId !== ownId) return;
                  const delta: Record<string, number[]> = {
                    ArrowLeft: [-1, 0],
                    ArrowRight: [1, 0],
                    ArrowUp: [0, -1],
                    ArrowDown: [0, 1],
                  };
                  if (delta[e.key]) {
                    e.preventDefault();
                    moveToken(
                      p.id,
                      p.x + delta[e.key][0],
                      p.y + delta[e.key][1],
                    );
                  }
                }}
              >
                <Avatar
                  name={p.name}
                  color={p.color}
                  monster={p.kind === "monster"}
                  small
                />
              </button>
            ),
          )}
      </div>
      {!compact && (
        <div className="map-footer">
          <span className="muted flex">
            <Move size={15} />
            {selected
              ? "Figur gewählt: auf ein Zielfeld klicken oder Pfeiltasten nutzen."
              : "Figur auswählen, dann auf ein Zielfeld klicken. Auch mit Pfeiltasten bewegbar."}
          </span>
          <span className="badge">Lokale Karte</span>
        </div>
      )}
    </div>
  );
}
