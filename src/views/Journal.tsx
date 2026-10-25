import {
  BookOpen,
  Download,
  Upload,
  FolderHeart,
  Feather,
  Laptop,
} from "lucide-react";
import type { CampaignState, Role } from "../domain/types";
import type { Change } from "../components/ui";

export function Journal({
  state,
  change,
  role,
  exportCampaign,
  openImport,
}: {
  state: CampaignState;
  change: Change;
  role: Role;
  exportCampaign: () => void;
  openImport: () => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">KEIN GUTER FADEN GEHT VERLOREN</div>
          <h1>
            Sitzungsnotizen<span className="heading-dot">.</span>
          </h1>
          <p>Ein Platz für offene Fragen, neue Spuren und große Pläne.</p>
        </div>
        <span className="badge green">Automatisch gespeichert</span>
      </div>
      {role === "player" ? (
        <section className="card journal-player">
          <BookOpen size={32} />
          <h2>Die Notizen des Spielleiters</h2>
          <p>
            Hier sammelt der Spielleiter seine Vorbereitung. Gemeinsame Notizen
            kommen in einer späteren Version hinzu.
          </p>
        </section>
      ) : (
        <div className="journal-layout">
          <div className="journal-main">
            <section className="card campaign-settings">
              <div className="card-heading">
                <h2>
                  <BookOpen size={18} />
                  Kampagne & Vorbereitung
                </h2>
              </div>
              <div className="journal-form">
                <label className="field">
                  Kampagnenname
                  <input
                    maxLength={150}
                    value={state.campaign.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      change((s) => ({
                        ...s,
                        campaign: { ...s.campaign, name: value },
                      }));
                    }}
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    Kapitel
                    <input
                      maxLength={150}
                      value={state.campaign.chapter}
                      onChange={(e) => {
                        const value = e.target.value;
                        change((s) => ({
                          ...s,
                          campaign: { ...s.campaign, chapter: value },
                        }));
                      }}
                    />
                  </label>
                  <label className="field">
                    Sitzung
                    <input
                      type="number"
                      min={1}
                      max={9999}
                      value={state.campaign.session}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (
                          Number.isInteger(value) &&
                          value >= 1 &&
                          value <= 9999
                        )
                          change((s) => ({
                            ...s,
                            campaign: { ...s.campaign, session: value },
                          }));
                      }}
                    />
                  </label>
                </div>
                <label className="field">
                  Begegnung
                  <input
                    maxLength={150}
                    value={state.combat.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      change((s) => ({
                        ...s,
                        combat: { ...s.combat, name: value },
                      }));
                    }}
                  />
                </label>
              </div>
            </section>
            <section className="notebook" aria-label="Abenteuer-Notizbuch">
              <div className="notebook-binding" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="book-ribbon" aria-hidden="true" />
              <div className="notebook-page">
                <header className="notebook-heading">
                  <span>AUFZEICHNUNGEN EINES ABENTEUERS</span>
                  <span>
                    Sitzung {String(state.campaign.session).padStart(2, "0")}
                  </span>
                </header>
                <div className="notebook-title">
                  <Feather size={25} />
                  <h2>Was uns in Erinnerung bleibt …</h2>
                </div>
                <label className="notebook-label" htmlFor="session-notes">
                  SL-Notizen
                </label>
                <textarea
                  id="session-notes"
                  className="notebook-writing"
                  rows={13}
                  maxLength={100000}
                  value={state.campaign.notes}
                  onChange={(e) => {
                    const value = e.target.value;
                    change((s) => ({
                      ...s,
                      campaign: { ...s.campaign, notes: value },
                    }));
                  }}
                  placeholder="Liebes Abenteuerbuch, heute …"
                  spellCheck
                  lang="de"
                />
                <footer className="notebook-footer">
                  <span>Die Asche vergeht. Die Geschichten bleiben.</span>
                  <span>✦</span>
                </footer>
              </div>
            </section>
          </div>
          <aside>
            <section className="card backup-card">
              <span className="action-icon sage">
                <FolderHeart size={25} />
              </span>
              <h2>Ein sicherer Platz für eure Geschichte.</h2>
              <p>
                Dein Spielstand liegt im Browser auf diesem Gerät. Exportiere
                ihn regelmäßig als Datei, um ihn zu sichern oder auf ein anderes
                Gerät mitzunehmen.
              </p>
              <button className="button primary" onClick={exportCampaign}>
                <Download size={17} />
                Spielstand exportieren
              </button>
              <button className="button subtle" onClick={openImport}>
                <Upload size={17} />
                Spielstand importieren
              </button>
            </section>
            <div className="hint-box">
              <Laptop size={20} />
              <p>
                Notizen werden beim Schreiben lokal gespeichert. Die Handschrift
                ist auch ohne Internetverbindung verfügbar.
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
