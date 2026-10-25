import { useEffect, useRef } from "react";
import { X, Skull } from "lucide-react";
import type { ReactNode } from "react";
import type { Color } from "../domain/types";

export function D20({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 3 43 14v20L24 45 5 34V14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m24 3-10 25h20L24 3ZM5 14l9 14-9 6m38-20-9 14 9 6M14 28l10 17 10-17"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Avatar({
  name,
  color = "sage",
  monster = false,
  small = false,
}: {
  name: string;
  color?: Color;
  monster?: boolean;
  small?: boolean;
}) {
  return (
    <span
      className={"avatar " + color + (small ? " small" : "")}
      aria-hidden="true"
    >
      {monster ? (
        <Skull size={small ? 17 : 23} />
      ) : (
        name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
      )}
    </span>
  );
}
export function HpBar({ hp, maxHp }: { hp: number; maxHp: number }) {
  return (
    <div
      className="hp-track"
      role="meter"
      aria-label="Trefferpunkte"
      aria-valuemin={0}
      aria-valuemax={maxHp}
      aria-valuenow={hp}
    >
      <span
        className={hp / maxHp < 0.3 ? "low" : ""}
        style={{ width: (hp / maxHp) * 100 + "%" }}
      />
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal" + (wide ? " wide" : "")}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Schließen"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
export type Change = (
  update: (
    s: import("../domain/types").CampaignState,
  ) => import("../domain/types").CampaignState,
  record?: boolean,
) => void;
