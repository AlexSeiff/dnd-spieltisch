import test from "node:test";
import assert from "node:assert/strict";
import {
  dieMesh,
  visualDice,
  faceOrientation,
  rotate,
  dot,
} from "../src/domain/diceGeometry.ts";
import { initialState } from "../src/domain/seed.ts";
import { parseCampaign } from "../src/domain/storage.ts";
import { ATLAS_MAPS } from "../src/domain/atlas.ts";
import { MAP_IDS } from "../src/domain/types.ts";

test("Standardwürfel besitzen die passende Zahl geschlossener Außenflächen", () => {
  for (const sides of [4, 6, 8, 10, 12, 20]) {
    const mesh = dieMesh(sides);
    assert.equal(mesh.faces.length, sides);
    for (const face of mesh.faces) {
      assert.ok(face.indices.length >= 3);
      assert.ok(dot(face.normal, face.center) > 0);
      assert.ok(face.indices.every((i) => i >= 0 && i < mesh.vertices.length));
      assert.ok(
        mesh.vertices.every(
          (p) => dot(face.normal, p) - dot(face.normal, face.center) < 1e-5,
        ),
      );
    }
  }
  assert.ok(dieMesh(10).faces.every((f) => f.indices.length === 4));
  assert.ok(dieMesh(12).faces.every((f) => f.indices.length === 5));
});
test("Die sichtbare Ergebnisfläche stimmt bei jedem Standardwurf mit dem Wurf überein", () => {
  for (const sides of [4, 6, 8, 10, 12, 20])
    for (let value = 1; value <= sides; value++) {
      const [visual] = visualDice(sides, [value]);
      assert.equal(visual.labels[visual.faceIndex], String(value));
      const mesh = dieMesh(sides),
        orientation = faceOrientation(mesh, visual.faceIndex);
      const front = rotate(mesh.faces[visual.faceIndex].normal, orientation);
      assert.ok(front[2] > 0.96);
      assert.ok(
        mesh.faces.every(
          (f) => rotate(f.normal, orientation)[2] <= front[2] + 1e-6,
        ),
      );
    }
});
test("Prozentwürfe zeigen Zehner und Einer, 00 und 0 stehen für 100", () => {
  for (let value = 1; value <= 100; value++) {
    const [tens, ones] = visualDice(100, [value]);
    const combined = tens.value + ones.value;
    assert.equal(combined || 100, value);
    assert.equal(tens.sides, 10);
    assert.equal(ones.sides, 10);
    assert.equal(
      tens.labels[tens.faceIndex],
      String(tens.value).padStart(2, "0"),
    );
    assert.equal(ones.labels[ones.faceIndex], String(ones.value));
  }
});
test("Mehrfachwürfe behalten ihre Zuordnung; sehr große Würfe begrenzen nur die Darstellung", () => {
  const displayed = visualDice(20, [4, 18]);
  assert.deepEqual(
    displayed.map((d) => d.sourceIndex),
    [0, 1],
  );
  assert.deepEqual(
    displayed.map((d) => d.value),
    [4, 18],
  );
  assert.equal(visualDice(6, Array(100).fill(3)).length, 6);
  assert.equal(visualDice(100, Array(100).fill(45)).length, 12);
  const [custom] = visualDice(37, [34]);
  assert.equal(custom.labels[custom.faceIndex], "34");
});
test("Alte Spielstände ohne Atlas bleiben importierbar", () => {
  const state = initialState();
  assert.equal(state.atlas, undefined);
  assert.deepEqual(parseCampaign(JSON.stringify(state)), state);
});
test("Atlas, aktive Karte und eigene Bilder überstehen JSON-Export und Import", () => {
  const state = initialState();
  state.atlas = {
    activeMapId: "city",
    images: {
      world: "data:image/jpeg;base64,AA==",
      city: "data:image/png;base64,AA==",
    },
  };
  assert.deepEqual(parseCampaign(JSON.stringify(state)), state);
  const invalid = JSON.parse(JSON.stringify(state));
  invalid.atlas.activeMapId = "unknown";
  assert.throws(() => parseCampaign(JSON.stringify(invalid)));
  invalid.atlas.activeMapId = "world";
  invalid.atlas.images.world = "https://example.org/private.png";
  assert.throws(() => parseCampaign(JSON.stringify(invalid)));
  invalid.atlas.images.world = "data:image/jpeg;base64,AA==";
  invalid.atlas.images.unknown = "data:image/jpeg;base64,AA==";
  assert.throws(() => parseCampaign(JSON.stringify(invalid)));
});
test("Kartenverknüpfungen und Ortspositionen sind konsistent", () => {
  assert.deepEqual(
    ATLAS_MAPS.map((m) => m.id),
    MAP_IDS,
  );
  for (const map of ATLAS_MAPS)
    for (const place of map.places) {
      assert.ok(place.x > 0 && place.x < 100 && place.y > 0 && place.y < 100);
      assert.ok(!place.destination || MAP_IDS.includes(place.destination));
      assert.ok(place.description.length > 20);
    }
});
