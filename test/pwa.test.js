import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { mkdtemp, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildOfflineWorker } from "../scripts/build-pwa.mjs";

async function bundle(t) {
  const directory = await mkdtemp(join(tmpdir(), "bayernquiz-pwa-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(new URL("../src/", import.meta.url), directory, { recursive: true });
  await cp(new URL("../assets/", import.meta.url), join(directory, "assets"), { recursive: true });
  await cp(new URL("../LICENSE", import.meta.url), join(directory, "LICENSE"));
  return directory;
}

test("manifest and PNG icons support root and subdirectory installation", async () => {
  const manifest = JSON.parse(await readFile(new URL("../src/manifest.webmanifest", import.meta.url)));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.lang, "de");
  for (const base of ["https://example.org/", "https://example.org/BayernQuiz/"]) {
    for (const field of ["id", "scope", "start_url"]) assert.equal(new URL(manifest[field], base).href, base);
    for (const icon of manifest.icons) {
      assert.ok(new URL(icon.src, base).href.startsWith(base));
      const data = await readFile(new URL(`../src/${icon.src}`, import.meta.url));
      assert.equal(data.subarray(1, 4).toString(), "PNG");
      assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes);
    }
  }
  assert.ok(manifest.icons.some(icon => icon.purpose === "maskable"));
});

test("precache contains the entire bundle and changes only when its inputs change", async t => {
  const directory = await bundle(t);
  const first = await buildOfflineWorker(directory);
  const second = await buildOfflineWorker(directory);
  assert.deepEqual(second, first);
  for (const path of ["index.html", "regions.svg", "game.js", "pwa.js", "app.js", "quiz-controller.js", "quiz-view.js", "map-view.js",
    "settings-view.js", "info-cards.js", "layout.js", "events.js", "manifest.webmanifest", "LICENSE",
    "assets/lakes/chiemsee.jpg", "assets/cities/ATTRIBUTION.md", "assets/nature-reserves/metadata.json"]) {
    assert.ok(first.paths.includes(path), path);
  }
  assert.ok(!first.paths.includes("sw.js"));
  await writeFile(join(directory, "regions.svg"), "changed map");
  assert.notEqual((await buildOfflineWorker(directory)).version, first.version);
});

async function worker(t, base, failInstall = false) {
  const directory = await bundle(t);
  const { paths, version } = await buildOfflineWorker(directory);
  const handlers = {};
  const stored = new Map();
  const deleted = [];
  const fetched = [];
  let claimed = false;
  const prefix = `bayernquiz:${base}:`;
  const cacheName = `${prefix}${version}`;
  stored.set(`${prefix}old`, new Map());
  stored.set("other-app", new Map());
  stored.set("bayernquiz:https://example.org/another/:old", new Map());
  vm.runInNewContext(await readFile(join(directory, "sw.js"), "utf8"), {
    URL, Request, Set,
    self: {
      registration: { scope: base },
      clients: { claim: async () => { claimed = true; } },
      addEventListener: (name, handler) => { handlers[name] = handler; },
    },
    caches: {
      open: async name => {
        if (!stored.has(name)) stored.set(name, new Map());
        return {
          addAll: async requests => {
            if (failInstall) throw new Error("download interrupted");
            for (const request of requests) stored.get(name).set(request.url, `cached:${request.url}`);
          },
          match: async key => stored.get(name).get(key),
        };
      },
      keys: async () => [...stored.keys()],
      delete: async name => { deleted.push(name); return stored.delete(name); },
    },
    fetch: async request => { fetched.push(request.url); return "network"; },
  });
  async function lifecycle(name) {
    let completion;
    handlers[name]({ waitUntil: promise => { completion = promise; } });
    await completion;
  }
  async function fetchPath(path, method = "GET") {
    let response;
    handlers.fetch({ request: new Request(new URL(path, base), { method }), respondWith: promise => { response = promise; } });
    return response;
  }
  return { lifecycle, fetchPath, stored, deleted, fetched, paths, cacheName, prefix, claimed: () => claimed };
}

for (const base of ["https://example.org/", "https://example.org/BayernQuiz/"]) {
  test(`offline cache and isolated cleanup at ${base}`, async t => {
    const sw = await worker(t, base);
    await sw.lifecycle("install");
    assert.equal(sw.stored.get(sw.cacheName).size, sw.paths.length);
    assert.equal(sw.claimed(), false);
    await sw.lifecycle("activate");
    assert.equal(sw.claimed(), true);
    assert.deepEqual(sw.deleted, [`${sw.prefix}old`]);
    assert.ok(sw.stored.has("other-app"));
    for (const path of ["./", "./?launch=home", "index.html?launch=home", "regions.svg", "assets/lakes/chiemsee.jpg"]) {
      assert.match(await sw.fetchPath(path), /^cached:/);
    }
    assert.equal(await sw.fetchPath("https://de.wikipedia.org/wiki/Bayern"), undefined);
    assert.equal(await sw.fetchPath("missing.html"), undefined);
    assert.equal(await sw.fetchPath("index.html", "POST"), undefined);
    assert.equal(await sw.fetchPath("sw.js"), undefined);
    sw.stored.get(sw.cacheName).delete(new URL("regions.svg", base).href);
    assert.equal(await sw.fetchPath("regions.svg"), "network");
  });
}

test("failed download discards incomplete cache and keeps the previous version", async t => {
  const sw = await worker(t, "https://example.org/BayernQuiz/", true);
  await assert.rejects(sw.lifecycle("install"), /download interrupted/);
  assert.equal(sw.stored.has(sw.cacheName), false);
  assert.equal(sw.stored.has(`${sw.prefix}old`), true);
  assert.equal(sw.claimed(), false);
});
