import { useEffect, useRef, useState } from "react";
import {
  Globe2,
  Building2,
  Castle,
  Swords,
  MapPin,
  ArrowUpRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Upload,
  Compass,
  Grid2X2,
} from "lucide-react";
import type { CampaignState, MapId, Role } from "../domain/types";
import { ATLAS_MAPS, atlasMap } from "../domain/atlas";
import type { Change } from "../components/ui";
import { BattleMap } from "../components/BattleMap";
import { WorldMap, CityMap, DungeonMap } from "../components/MapArt";
const icons = {
  world: Globe2,
  city: Building2,
  dungeon: Castle,
  bridge: Swords,
};
function Art({ id }: { id: MapId }) {
  return id === "world" ? (
    <WorldMap />
  ) : id === "city" ? (
    <CityMap />
  ) : (
    <DungeonMap />
  );
}
export function Atlas({
  state,
  change,
  role,
  ownId,
  notify,
}: {
  state: CampaignState;
  change: Change;
  role: Role;
  ownId: string;
  notify: (message: string) => void;
}) {
  const activeId = state.atlas?.activeMapId || "world",
    map = atlasMap(activeId);
  const [selectedId, setSelectedId] = useState(""),
    [zoom, setZoom] = useState(1),
    [grid, setGrid] = useState(false);
  const viewport = useRef<HTMLDivElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const image = state.atlas?.images[activeId],
    places = image ? [] : map.places,
    selected = places.find((p) => p.id === selectedId) || places[0];
  useEffect(() => {
    setZoom(1);
    setSelectedId("");
    setGrid(false);
  }, [activeId]);
  const open = (id: MapId) => {
    change((s) => ({
      ...s,
      atlas: { activeMapId: id, images: s.atlas?.images || {} },
    }));
    requestAnimationFrame(() =>
      document
        .getElementById("atlas-active-map")
        ?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
          block: "start",
        }),
    );
  };
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 8_000_000
    ) {
      notify("Bitte ein PNG-, JPG- oder WebP-Bild bis 8 MB wählen.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file),
        ratio = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
      canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        bitmap.close();
        throw new Error("Das Bild konnte nicht verarbeitet werden.");
      }
      ctx.fillStyle = "#efe4c6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      let encoded = canvas.toDataURL("image/jpeg", 0.85);
      if (encoded.length > 2_800_000)
        encoded = canvas.toDataURL("image/jpeg", 0.6);
      if (encoded.length > 2_800_000)
        throw new Error(
          "Die Karte ist zu detailreich. Bitte ein kleineres Bild verwenden.",
        );
      change((s) => ({
        ...s,
        atlas: {
          activeMapId: activeId,
          images: { ...s.atlas?.images, [activeId]: encoded },
        },
      }));
      notify(
        "Eigene Karte geladen. Die Ortsmarkierungen der Beispielkarte sind ausgeblendet.",
      );
    } catch (e) {
      notify(
        e instanceof Error
          ? e.message
          : "Die Karte konnte nicht geladen werden.",
      );
    }
  }
  const changeZoom = (value: number) => {
    const next = Math.max(1, Math.min(2.5, value)),
      element = viewport.current;
    const left = element
        ? (element.scrollLeft + element.clientWidth / 2) / zoom
        : 0,
      top = element ? (element.scrollTop + element.clientHeight / 2) / zoom : 0;
    setZoom(next);
    requestAnimationFrame(() => {
      if (element) {
        element.scrollLeft = left * next - element.clientWidth / 2;
        element.scrollTop = top * next - element.clientHeight / 2;
      }
    });
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            VON DER WEITEN WELT BIS ZUR VERBORGENEN KAMMER
          </div>
          <h1>
            Euer Atlas<span className="heading-dot">.</span>
          </h1>
          <p>
            Folgt alten Wegen, entdeckt neue Orte und zeichnet euer Abenteuer.
          </p>
        </div>
        <span className="badge">4 Karten · eine Geschichte</span>
      </div>
      <div className="atlas-library" aria-label="Kartenbibliothek">
        {ATLAS_MAPS.map((m) => {
          const Icon = icons[m.id];
          return (
            <button
              key={m.id}
              className={
                "atlas-library-card" + (activeId === m.id ? " selected" : "")
              }
              aria-pressed={activeId === m.id}
              onClick={() => open(m.id)}
            >
              <span className="atlas-thumbnail">
                {m.id === "bridge" ? (
                  <BattleMap state={state} compact />
                ) : state.atlas?.images[m.id] ? (
                  <img
                    className="atlas-art"
                    src={state.atlas.images[m.id]}
                    alt=""
                  />
                ) : (
                  <Art id={m.id} />
                )}
              </span>
              <span className="atlas-library-label">
                <Icon size={18} />
                <span>
                  <small>{m.category}</small>
                  <strong>{m.title}</strong>
                </span>
                <span className="atlas-card-dot" />
              </span>
            </button>
          );
        })}
      </div>
      {activeId === "bridge" ? (
        <section
          id="atlas-active-map"
          className="card map-page atlas-battle-page"
        >
          <div className="card-heading">
            <h2>
              <Swords size={18} />
              {map.title}
            </h2>
            <span className="badge">
              Aktuelle Begegnung · {state.combat.participants.length} Figuren
            </span>
          </div>
          <BattleMap
            state={state}
            change={change}
            role={role}
            ownId={ownId}
            notify={notify}
          />
        </section>
      ) : (
        <div className="atlas-layout">
          <section id="atlas-active-map" className="card atlas-map-card">
            <div className="atlas-map-heading">
              <div>
                <span className="eyebrow">{map.category}</span>
                <h2>{map.title}</h2>
                <p>{map.subtitle}</p>
              </div>
              <div className="atlas-tools">
                <button
                  className="icon-button"
                  aria-label="Karte verkleinern"
                  disabled={zoom <= 1}
                  onClick={() => changeZoom(zoom - 0.25)}
                >
                  <ZoomOut size={17} />
                </button>
                <button
                  className="zoom-value"
                  title="Zoom zurücksetzen"
                  onClick={() => changeZoom(1)}
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  className="icon-button"
                  aria-label="Karte vergrößern"
                  disabled={zoom >= 2.5}
                  onClick={() => changeZoom(zoom + 0.25)}
                >
                  <ZoomIn size={17} />
                </button>
                <button
                  className={"icon-button" + (grid ? " selected" : "")}
                  aria-label="Kartenraster umschalten"
                  aria-pressed={grid}
                  onClick={() => setGrid(!grid)}
                >
                  <Grid2X2 size={17} />
                </button>
                {role === "gm" && (
                  <button
                    className="icon-button"
                    aria-label="Eigene Karte laden"
                    title="Eigene Karte laden"
                    onClick={() => fileInput.current?.click()}
                  >
                    <Upload size={17} />
                  </button>
                )}
                {role === "gm" && image && (
                  <button
                    className="icon-button"
                    aria-label="Beispielkarte wiederherstellen"
                    onClick={() =>
                      change((s) => {
                        const images = { ...s.atlas?.images };
                        delete images[activeId];
                        return {
                          ...s,
                          atlas: { activeMapId: activeId, images },
                        };
                      })
                    }
                  >
                    <RotateCcw size={17} />
                  </button>
                )}
              </div>
            </div>
            <div
              ref={viewport}
              className={"atlas-viewport" + (zoom > 1 ? " can-pan" : "")}
              onPointerDown={(e) => {
                if (
                  zoom <= 1 ||
                  e.pointerType !== "mouse" ||
                  (e.target as HTMLElement).closest("button")
                )
                  return;
                const el = e.currentTarget;
                drag.current = {
                  x: e.clientX,
                  y: e.clientY,
                  left: el.scrollLeft,
                  top: el.scrollTop,
                };
                el.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (drag.current) {
                  e.currentTarget.scrollLeft =
                    drag.current.left + drag.current.x - e.clientX;
                  e.currentTarget.scrollTop =
                    drag.current.top + drag.current.y - e.clientY;
                }
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
            >
              <div
                className={"atlas-map-surface" + (grid ? " atlas-grid" : "")}
                style={{ width: zoom * 100 + "%" }}
              >
                {image ? (
                  <img
                    className="atlas-art"
                    src={image}
                    alt={"Eigene " + map.category}
                  />
                ) : (
                  <Art id={activeId} />
                )}
                {places.map((p) => (
                  <button
                    key={p.id}
                    className={
                      "atlas-pin" + (selected?.id === p.id ? " active" : "")
                    }
                    style={{ left: p.x + "%", top: p.y + "%" }}
                    aria-label={p.name + " – " + p.kind}
                    aria-pressed={selected?.id === p.id}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span>
                      <MapPin size={16} />
                    </span>
                    <strong>{p.name}</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="atlas-map-footer">
              <span className="flex">
                <Compass size={15} />
                {image
                  ? "Eigene Karte · lokal gespeichert"
                  : "Ort anklicken, um mehr zu erfahren."}
              </span>
              <span className="map-scale">
                <i />
                {map.scale}
              </span>
            </div>
            <input
              hidden
              type="file"
              ref={fileInput}
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                void upload(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </section>
          <aside className="atlas-location-panel">
            <section className="card place-detail">
              <div className="card-heading">
                <h2>
                  <MapPin size={18} />
                  Am Wegesrand
                </h2>
                <span className="badge">{places.length} Orte</span>
              </div>
              {selected ? (
                <div className="place-description">
                  <span className="eyebrow">{selected.kind}</span>
                  <h3>{selected.name}</h3>
                  <p>{selected.description}</p>
                  {selected.destination && (
                    <button
                      className="button primary"
                      onClick={() => open(selected.destination!)}
                    >
                      {atlasMap(selected.destination).category} öffnen
                      <ArrowUpRight size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="place-description">
                  <h3>Deine eigene Karte</h3>
                  <p>
                    Hier ist Platz für deine Welt. Die festen Ortsmarkierungen
                    gehören nur zu unseren Beispielkarten.
                  </p>
                </div>
              )}
            </section>
            {places.length > 0 && (
              <section className="card atlas-place-list">
                <div className="card-heading">
                  <h2>Orte entdecken</h2>
                </div>
                {places.map((p) => (
                  <button
                    key={p.id}
                    className={selected?.id === p.id ? "active" : ""}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <MapPin size={14} />
                    <span>
                      {p.name}
                      <small>{p.kind}</small>
                    </span>
                    <span>↗</span>
                  </button>
                ))}
              </section>
            )}
            <div className="hint-box">
              <Compass size={19} />
              <p>
                Mit + näher heranzoomen und die Karte mit der Maus verschieben.
                Auf dem Touchscreen lässt sie sich scrollen. Die Karten sind
                eigene, schematische Beispielwelten.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
