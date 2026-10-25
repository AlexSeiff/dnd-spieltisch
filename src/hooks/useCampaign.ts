import { useEffect, useReducer, useRef, useState } from "react";
import type { CampaignState } from "../domain/types";
import { loadCampaign, STORAGE_KEY } from "../domain/storage";

type Action =
  | {
      type: "change";
      update: (s: CampaignState) => CampaignState;
      record: boolean;
    }
  | { type: "undo" }
  | { type: "replace"; state: CampaignState };
interface History {
  present: CampaignState;
  past: CampaignState[];
  loadError: string | null;
}
function reducer(history: History, action: Action): History {
  if (action.type === "undo") {
    const previous = history.past.at(-1);
    return previous
      ? { ...history, present: previous, past: history.past.slice(0, -1) }
      : history;
  }
  if (action.type === "replace")
    return {
      present: action.state,
      past: [...history.past, history.present].slice(-30),
      loadError: null,
    };
  const next = action.update(history.present);
  return next === history.present
    ? history
    : {
        ...history,
        loadError: null,
        present: next,
        past: action.record
          ? [...history.past, history.present].slice(-30)
          : history.past,
      };
}
export function useCampaign() {
  const [history, dispatch] = useReducer(reducer, null, () => {
    const loaded = loadCampaign();
    return { present: loaded.state, past: [], loadError: loaded.error };
  });
  const lastSaved = useRef(history.present);
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => {
    if (history.present === lastSaved.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.present));
      lastSaved.current = history.present;
      setSaveError(null);
    } catch {
      setSaveError(
        "Speichern im Browser fehlgeschlagen. Bitte exportiere deinen Spielstand als Sicherung.",
      );
    }
  }, [history.present]);
  return {
    state: history.present,
    canUndo: history.past.length > 0,
    error: saveError || history.loadError,
    change: (update: (s: CampaignState) => CampaignState, record = true) =>
      dispatch({ type: "change", update, record }),
    undo: () => dispatch({ type: "undo" }),
    replace: (state: CampaignState) => dispatch({ type: "replace", state }),
  };
}
