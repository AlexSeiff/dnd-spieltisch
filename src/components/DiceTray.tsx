import { useEffect, useRef } from "react";
import type { DiceResult } from "../domain/types";
import {
  dieMesh,
  visualDice,
  faceOrientation,
  rotate,
  multiply,
  axisAngle,
  normalize,
  dot,
  cross,
  scale,
  sub,
  add,
} from "../domain/diceGeometry";
import type { Vec3, Quaternion, VisualDie } from "../domain/diceGeometry";

export const ROLL_DURATION = 2100;
function paintDie(
  ctx: CanvasRenderingContext2D,
  die: VisualDie,
  x: number,
  y: number,
  size: number,
  q: Quaternion,
  fade: number,
) {
  const mesh = dieMesh(die.sides);
  const transformed = mesh.vertices.map((v) => rotate(v, q));
  const project = (v: Vec3): [number, number] => {
    const p = 4.5 / (4.5 - v[2]);
    return [x + v[0] * size * p, y - v[1] * size * p];
  };
  const light = normalize([-0.5, 0.8, 1]);
  const faces = mesh.faces
    .map((f, index) => ({
      f,
      index,
      normal: rotate(f.normal, q),
      center: rotate(f.center, q),
    }))
    .filter((f) => f.normal[2] > 0.02)
    .sort((a, b) => a.center[2] - b.center[2]);
  for (const { f, index, normal, center } of faces) {
    const points = f.indices.map((i) => project(transformed[i]));
    ctx.beginPath();
    points.forEach(([px, py], i) =>
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py),
    );
    ctx.closePath();
    const brightness = 0.52 + Math.max(0, dot(normal, light)) * 0.6;
    const gradient = ctx.createLinearGradient(
      x - size,
      y - size,
      x + size,
      y + size,
    );
    gradient.addColorStop(
      0,
      "rgb(" +
        [59, 110, 84].map((c) => Math.round(c * brightness)).join(",") +
        ")",
    );
    gradient.addColorStop(
      1,
      "rgb(" +
        [27, 60, 48].map((c) => Math.round(c * brightness)).join(",") +
        ")",
    );
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "rgba(211,190,130," + (0.38 + 0.27 * normal[2]) + ")";
    ctx.lineWidth = 1.15;
    ctx.lineJoin = "round";
    ctx.stroke();
    if (normal[2] < 0.22) continue;
    const resting = faceOrientation(mesh, index),
      inverse: Quaternion = [-resting[0], -resting[1], -resting[2], resting[3]];
    const rawU = rotate([1, 0, 0], inverse),
      u = normalize(sub(rawU, scale(f.normal, dot(rawU, f.normal)))),
      v = scale(cross(f.normal, u), -1);
    const [cx, cy] = project(center),
      [ux, uy] = project(add(center, rotate(u, q))),
      [vx, vy] = project(add(center, rotate(v, q)));
    ctx.save();
    ctx.translate(cx, cy);
    ctx.transform(
      (ux - cx) / size,
      (uy - cy) / size,
      (vx - cx) / size,
      (vy - cy) / size,
      0,
      0,
    );
    ctx.font =
      "600 " +
      size *
        (f.indices.length === 3 ? 0.41 : 0.49) *
        Math.min(1, 2 / die.labels[index].length) +
      "px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(249,228,172," + fade + ")";
    ctx.shadowColor = "#0008";
    ctx.shadowBlur = 2;
    ctx.fillText(die.labels[index], 0, size * 0.015);
    if (die.labels[index] === "6" || die.labels[index] === "9") {
      ctx.font = size * 0.24 + "px Georgia";
      ctx.fillText("·", 0, size * 0.22);
    }
    ctx.restore();
  }
}
export function DiceTray({
  result,
  rolling = false,
}: {
  result: DiceResult | null;
  rolling?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dice = visualDice(result?.sides || 20, result?.rolls || [20]);
    let width = 400,
      height = 280,
      frame = 0,
      start = performance.now();
    const draw = (now: number) => {
      const progress =
        rolling && !motion.matches
          ? Math.min(1, (now - start) / ROLL_DURATION)
          : 1;
      const remaining = 1 - progress;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const columns =
          dice.length === 1 ? 1 : dice.length > 6 ? 4 : dice.length > 2 ? 3 : 2,
        rows = Math.ceil(dice.length / columns);
      const size = Math.min(79, width / (columns * 2.7), height / (rows * 2.5));
      dice.forEach((die, i) => {
        const row = Math.floor(i / columns),
          inRow = Math.min(columns, dice.length - row * columns),
          column = i % columns;
        const finalX =
          width / 2 + ((column - (inRow - 1) / 2) * width) / (columns + 0.65);
        const finalY =
          height / 2 + ((row - (rows - 1) / 2) * height) / (rows + 0.6);
        const phase = i * 0.55;
        const bounce =
          Math.abs(Math.sin(progress * Math.PI * 4.5 + phase)) *
          remaining *
          remaining *
          70;
        const x =
          finalX + (i % 2 ? -1 : 1) * width * 0.38 * Math.pow(remaining, 2.5);
        const y = finalY - bounce - 20 * remaining;
        ctx.save();
        ctx.translate(x, finalY + size * 0.7);
        ctx.scale(1, 0.25);
        ctx.beginPath();
        ctx.arc(0, 0, size * (0.86 + bounce / 100), 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0," + (0.3 - bounce / 350) + ")";
        ctx.filter = "blur(12px)";
        ctx.fill();
        ctx.restore();
        const spin = Math.pow(remaining, 2.7);
        const target = faceOrientation(dieMesh(die.sides), die.faceIndex);
        const rotation = multiply(
          axisAngle([1, 0.4, 0.2], spin * (15 + i * 1.7)),
          multiply(axisAngle([0.3, 1, 0.7], spin * (22 + i * 1.1)), target),
        );
        paintDie(ctx, die, x, y, size, rotation, 1);
      });
      if (rolling && progress < 1) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      cancelAnimationFrame(frame);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      draw(performance.now());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const motionChanged = () => {
      cancelAnimationFrame(frame);
      draw(performance.now());
    };
    motion.addEventListener("change", motionChanged);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", motionChanged);
    };
  }, [result?.id, rolling]);
  const extra = Math.max(0, (result?.rolls.length || 0) - 6);
  return (
    <div
      className={"dice-tray" + (rolling ? " rolling" : "")}
      aria-busy={rolling}
    >
      <div className="tray-corner top-left" aria-hidden="true" />
      <div className="tray-corner bottom-right" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-label={
          rolling
            ? "Die Würfel rollen über den Würfelteller."
            : "Räumliche Würfel auf einem Würfelteller."
        }
        role="img"
      />
      <div className="tray-caption">
        <span>
          {rolling
            ? "DIE WÜRFEL ROLLEN …"
            : result
              ? result.sides === 100
                ? "W100 · ZEHNER & EINER"
                : "W" + result.sides
              : "DEIN WÜRFELTELLER"}
        </span>
        {extra > 0 && <span>+{extra} weitere im Ergebnis</span>}
      </div>
    </div>
  );
}
