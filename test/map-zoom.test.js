import test from "node:test";
import assert from "node:assert/strict";
import { fitMapBounds, constrainView, zoomView, panView, revealView, isDrag } from "../src/map-zoom.js";

const bounds = { x: 0, y: 0, width: 740, height: 740 };

test("zoom clamps to 1–4× and returns to the exact full-map view", () => {
  const close = zoomView(bounds, bounds, 100);
  assert.equal(close.width, 185);
  assert.equal(close.height, 185);
  assert.deepEqual(zoomView(close, bounds, 0.001), bounds);
  assert.deepEqual(zoomView(bounds, bounds, 0.8), bounds);
});

test("zoom keeps the cursor or pinch anchor fixed away from map edges", () => {
  const anchor = { x: 0.25, y: 0.75 };
  const view = zoomView(bounds, bounds, 2, anchor);
  assert.equal(view.x + view.width * anchor.x, bounds.width * anchor.x);
  assert.equal(view.y + view.height * anchor.y, bounds.height * anchor.y);
  assert.deepEqual(zoomView(view, bounds, 0.5, anchor), bounds);
});

test("panning is bounded and cannot move the full-map view", () => {
  assert.deepEqual(panView(bounds, bounds, 100, -100), bounds);
  const view = zoomView(bounds, bounds, 2);
  assert.deepEqual(panView(view, bounds, -1000, 1000), { x: 0, y: 370, width: 370, height: 370 });
  assert.deepEqual(panView(view, bounds, 30, -20), { x: 215, y: 165, width: 370, height: 370 });
});

test("viewport bounds retain aspect ratio and support a nonzero origin", () => {
  const area = { x: 10, y: 20, width: 800, height: 400 };
  assert.deepEqual(constrainView({ x: -100, y: 1000, width: 50 }, area), {
    x: 10, y: 320, width: 200, height: 100,
  });
});

test("keyboard focus reveals off-screen features without changing zoom", () => {
  const view = { x: 185, y: 185, width: 370, height: 370 };
  assert.deepEqual(revealView(view, bounds, { x: 600, y: 200, width: 10, height: 10 }), {
    x: 248, y: 185, width: 370, height: 370,
  });
  assert.deepEqual(revealView(view, bounds, { x: 200, y: 200, width: 10, height: 10 }), view);
  const edge = revealView(view, bounds, { x: 735, y: 735, width: 5, height: 5 });
  assert.equal(edge.x, 370);
  assert.equal(edge.y, 370);
});

test("large focused features reveal their center without needless jumps", () => {
  const view = { x: 185, y: 185, width: 370, height: 370 };
  assert.deepEqual(revealView(view, bounds, bounds), view);
  const result = revealView(view, bounds, { x: 500, y: 500, width: 240, height: 240 });
  assert.equal(result.x, 370);
  assert.equal(result.y, 370);
});

test("tap tolerance uses CSS pixel distance, including diagonal movement", () => {
  const start = { x: 10, y: 10 };
  assert.equal(isDrag(start, { x: 18, y: 10 }), false);
  assert.equal(isDrag(start, { x: 13, y: 14 }), false);
  assert.equal(isDrag(start, { x: 16, y: 16 }), true);
  assert.equal(isDrag(start, { x: 19, y: 10 }), true);
});

test("responsive map bounds fit wide and tall viewports without cropping the source", () => {
  assert.deepEqual(fitMapBounds(bounds, 2), { x: -370, y: 0, width: 1480, height: 740 });
  assert.deepEqual(fitMapBounds(bounds, 0.5), { x: 0, y: -370, width: 740, height: 1480 });
  assert.deepEqual(fitMapBounds(bounds, 1), bounds);
  assert.deepEqual(fitMapBounds(bounds, 0), bounds);
  assert.deepEqual(fitMapBounds(bounds, Infinity), bounds);
  const wide = fitMapBounds(bounds, 2);
  const zoomed = zoomView(wide, wide, 4);
  assert.equal(zoomed.width / zoomed.height, 2);
  assert.deepEqual(zoomView(zoomed, wide, 0.25), wide);
});
