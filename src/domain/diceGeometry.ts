export type Vec3 = [number, number, number];
export type Quaternion = [number, number, number, number];
export interface Face {
  indices: number[];
  normal: Vec3;
  center: Vec3;
}
export interface Mesh {
  vertices: Vec3[];
  faces: Face[];
}
export const add = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const sub = (a: Vec3, b: Vec3): Vec3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const scale = (v: Vec3, n: number): Vec3 => [
  v[0] * n,
  v[1] * n,
  v[2] * n,
];
export const dot = (a: Vec3, b: Vec3) =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const normalize = (v: Vec3) => scale(v, 1 / (Math.hypot(...v) || 1));

/** Build outward, coplanar polygon faces of a small convex die. */
export function convexMesh(points: Vec3[]): Mesh {
  const radius = Math.max(...points.map((p) => Math.hypot(...p)));
  const vertices = points.map((p) => scale(p, 1 / radius));
  const faces: Face[] = [];
  const seen = new Set<string>();
  for (let a = 0; a < vertices.length; a++)
    for (let b = a + 1; b < vertices.length; b++)
      for (let c = b + 1; c < vertices.length; c++) {
        let normal = normalize(
          cross(sub(vertices[b], vertices[a]), sub(vertices[c], vertices[a])),
        );
        if (Math.hypot(...normal) < 0.5) continue;
        const distances = vertices.map((v) => dot(normal, sub(v, vertices[a])));
        if (distances.some((d) => d > 1e-5) && distances.some((d) => d < -1e-5))
          continue;
        if (dot(normal, vertices[a]) < 0) normal = scale(normal, -1);
        const indices = vertices
          .map((_, i) => i)
          .filter(
            (i) => Math.abs(dot(normal, sub(vertices[i], vertices[a]))) < 1e-5,
          );
        const key = [...indices].sort((x, y) => x - y).join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        const center = scale(
          indices.reduce<Vec3>((sum, i) => add(sum, vertices[i]), [0, 0, 0]),
          1 / indices.length,
        );
        const u = normalize(sub(vertices[indices[0]], center)),
          v = cross(normal, u);
        indices.sort(
          (i, j) =>
            Math.atan2(
              dot(sub(vertices[i], center), v),
              dot(sub(vertices[i], center), u),
            ) -
            Math.atan2(
              dot(sub(vertices[j], center), v),
              dot(sub(vertices[j], center), u),
            ),
        );
        faces.push({ indices, normal, center });
      }
  return { vertices, faces };
}
const phi = (1 + Math.sqrt(5)) / 2;
const signs = [-1, 1];
const cube: Vec3[] = signs.flatMap((x) =>
  signs.flatMap((y) => signs.map((z) => [x, y, z] as Vec3)),
);
const ico: Vec3[] = signs.flatMap((a) =>
  signs.flatMap(
    (b) =>
      [
        [0, a, b * phi],
        [a, b * phi, 0],
        [b * phi, 0, a],
      ] as Vec3[],
  ),
);
const dodeca: Vec3[] = [
  ...cube,
  ...signs.flatMap((a) =>
    signs.flatMap(
      (b) =>
        [
          [0, a / phi, b * phi],
          [a / phi, b * phi, 0],
          [b * phi, 0, a / phi],
        ] as Vec3[],
    ),
  ),
];
const antiprism = convexMesh(
  Array.from({ length: 10 }, (_, i) => {
    const angle = (2 * Math.PI * (i % 5)) / 5 + (i >= 5 ? Math.PI / 5 : 0);
    return [Math.cos(angle), Math.sin(angle), i >= 5 ? -0.55 : 0.55] as Vec3;
  }),
);
const trapezohedron = antiprism.faces.map((f) =>
  scale(f.normal, 1 / dot(f.normal, f.center)),
);
const meshes: Record<number, Mesh> = {
  4: convexMesh([
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ]),
  6: convexMesh(cube),
  8: convexMesh([
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ]),
  10: convexMesh(trapezohedron),
  12: convexMesh(dodeca),
  20: convexMesh(ico),
};
export const dieMesh = (sides: number) => meshes[sides] || meshes[20];
export function multiply(a: Quaternion, b: Quaternion): Quaternion {
  const [x, y, z, w] = a,
    [u, v, t, s] = b;
  return [
    w * u + x * s + y * t - z * v,
    w * v - x * t + y * s + z * u,
    w * t + x * v - y * u + z * s,
    w * s - x * u - y * v - z * t,
  ];
}
export function axisAngle(axis: Vec3, angle: number): Quaternion {
  const v = scale(normalize(axis), Math.sin(angle / 2));
  return [...v, Math.cos(angle / 2)];
}
export function rotate(v: Vec3, q: Quaternion): Vec3 {
  const u: Vec3 = [q[0], q[1], q[2]];
  return add(
    v,
    add(scale(cross(u, v), 2 * q[3]), scale(cross(u, cross(u, v)), 2)),
  );
}
export function faceOrientation(mesh: Mesh, index: number): Quaternion {
  const a = mesh.faces[index].normal,
    b = normalize([0.12, -0.2, 1]);
  const v = cross(a, b),
    w = 1 + dot(a, b),
    length = Math.hypot(...v, w);
  if (length < 1e-6) return axisAngle([1, 0, 0], Math.PI);
  return [v[0] / length, v[1] / length, v[2] / length, w / length];
}
export interface VisualDie {
  sides: number;
  value: number;
  labels: string[];
  faceIndex: number;
  sourceIndex: number;
}
export function visualDice(sides: number, rolls: number[]): VisualDie[] {
  return rolls.slice(0, 6).flatMap((value, sourceIndex) => {
    if (sides === 100) {
      const tens = Math.floor((value % 100) / 10),
        ones = value % 10;
      return [
        {
          sides: 10,
          value: tens * 10,
          labels: Array.from({ length: 10 }, (_, i) =>
            String(i * 10).padStart(2, "0"),
          ),
          faceIndex: tens,
          sourceIndex,
        },
        {
          sides: 10,
          value: ones,
          labels: Array.from({ length: 10 }, (_, i) => String(i)),
          faceIndex: ones,
          sourceIndex,
        },
      ];
    }
    const mesh = dieMesh(sides),
      faceIndex = (value - 1) % mesh.faces.length;
    const labels = mesh.faces.map((_, i) => String(i + 1));
    labels[faceIndex] = String(value);
    return [{ sides, value, labels, faceIndex, sourceIndex }];
  });
}
