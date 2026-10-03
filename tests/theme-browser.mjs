// Run against a local production server with Node 22+ and Chrome installed:
// CHROME_PATH=/path/to/chrome node tests/theme-browser.mjs
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3100";
const captureDirectory = process.env.CAPTURE_DIR;
const profile = await mkdtemp(path.join(tmpdir(), "theme-chrome-"));
const port = 9223 + Math.floor(Math.random() * 1000);
const browser = spawn(chromePath, ["--headless=new", "--no-sandbox", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await response.json();
      const page = pages.find((item) => item.type === "page" && item.url === "about:blank");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Chrome debugging endpoint did not start");
}

let nextId = 0;
const pending = new Map();
const errors = [];
let socket;
let seoBaseline;
const headingBaseline = new Map();
const typeBaseline = new Map();
const typeSnapshot = `(() => [...document.querySelectorAll('header, main, footer, header *, main *, footer *')]
  .filter(el => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName))
  .map(el => {
    const css = getComputedStyle(el);
    return [el.tagName, css.fontSize, css.lineHeight];
  }))()`;

function compareType(actual, expected, label) {
  assert.equal(actual.length, expected.length, `${label}: element count changed`);
  for (let index = 0; index < actual.length; index += 1) {
    assert.deepEqual(actual[index], expected[index], `${label}: typography differs at element ${index}`);
  }
}

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}

async function waitFor(check, label) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate(check)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(await evaluate("({ href: location.href, ready: document.readyState, title: document.title })"))}`);
}

try {
  socket = new WebSocket(await waitForEndpoint());
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const task = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) task.reject(new Error(message.error.message));
      else task.resolve(message.result);
    }
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map((arg) => arg.value || arg.description).join(" "));
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.navigate", { url: origin });
  await waitFor("location.origin === '" + origin + "' && document.readyState !== 'loading'", "initial page");

  for (const width of [1280, 900, 700, 390]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
    for (const design of ["classic", "v2"]) {
      for (const color of ["dark", "light"]) {
        // Setting storage on the current page lets the next document read it
        // in its before-paint preference script.
        await evaluate(`localStorage.setItem('design', ${JSON.stringify(design)}); localStorage.setItem('theme', ${JSON.stringify(color)});`);
        await send("Page.navigate", { url: origin });
        await waitFor("document.readyState !== 'loading' && document.querySelector('[aria-label^=\"Switch to\"]') !== null", "page load");
        await waitFor("document.documentElement.dataset.design !== 'v2' || document.documentElement.dataset.designReady === 'true'", "V2 CSS");
        const state = await evaluate(`(() => ({
          design: document.documentElement.dataset.design,
          color: document.documentElement.dataset.theme,
          css: !!document.getElementById('design-v2-styles'),
          gallery: !!document.getElementById('gallery'),
          background: getComputedStyle(document.body).backgroundColor,
          hero: getComputedStyle(document.querySelector('[id="about"]')).minHeight,
          headingFontSize: getComputedStyle(document.querySelector('#about h1')).fontSize,
          headingLineHeight: getComputedStyle(document.querySelector('#about h1')).lineHeight,
          skillColumns: getComputedStyle(document.querySelector('#skills > div:last-child')).gridTemplateColumns.split(' ').length,
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(el => el.textContent),
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          duplicateIds: [...document.querySelectorAll('[id]')].map(el => el.id).filter((id, index, ids) => ids.indexOf(id) !== index),
          unlabeledButtons: [...document.querySelectorAll('button')].filter(el => !el.textContent.trim() && !el.getAttribute('aria-label')).length
        }))()`);
        assert.equal(state.design, design);
        assert.equal(state.color, color);
        assert.equal(state.css, design === "v2");
        assert.equal(state.gallery, true);
        assert.deepEqual(state.duplicateIds, []);
        assert.equal(state.unlabeledButtons, 0);
        assert.equal(state.overflow, false);
        assert.equal(state.skillColumns, width > 768 ? 2 : 1);
        if (!seoBaseline) seoBaseline = { canonical: state.canonical, schemas: state.schemas };
        assert.deepEqual({ canonical: state.canonical, schemas: state.schemas }, seoBaseline);
        if (!headingBaseline.has(width)) headingBaseline.set(width, { fontSize: state.headingFontSize, lineHeight: state.headingLineHeight });
        assert.deepEqual({ fontSize: state.headingFontSize, lineHeight: state.headingLineHeight }, headingBaseline.get(width));
        const type = await evaluate(typeSnapshot);
        const typeKey = `${width}-${color}`;
        if (design === "classic") typeBaseline.set(typeKey, type);
        else compareType(type, typeBaseline.get(typeKey), `home ${typeKey}`);
        const sectionSpacing = await evaluate(`(() => [...document.querySelectorAll('main > section')].map(section => {
          const css = getComputedStyle(section);
          return [section.id, parseFloat(css.paddingTop), parseFloat(css.paddingBottom), parseFloat(css.marginTop), parseFloat(css.marginBottom)];
        }))()`);
        const side = width <= 768 ? 25 : 40;
        for (const [id, top, bottom, marginTop, marginBottom] of sectionSpacing) {
          if (id !== "about") assert.ok(top <= side, `${design} ${id} top padding exceeds ${side}px`);
          assert.ok(bottom <= side, `${design} ${id} bottom padding exceeds ${side}px`);
          assert.equal(marginTop, 0);
          assert.equal(marginBottom, 0);
        }
        if (captureDirectory) {
          await mkdir(captureDirectory, { recursive: true });
          const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
          await writeFile(path.join(captureDirectory, `${width}-${design}-${color}.png`), Buffer.from(shot.data, "base64"));
        }
        console.log(width, design, color, state.hero);
      }
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 800));
  await evaluate(`document.querySelector('[aria-label="Toggle navigation"]').click()`);
  await waitFor("document.querySelector('[aria-label=\"Toggle navigation\"]').getAttribute('aria-expanded') === 'true'", "mobile navigation");
  assert.equal(await evaluate(`document.querySelectorAll('header a[href="#gallery"]').length > 0`), true);
  await evaluate(`document.querySelector('[aria-label="Toggle navigation"]').click()`);
  await waitFor("document.querySelector('[aria-label=\"Toggle navigation\"]').getAttribute('aria-expanded') === 'false'", "mobile navigation close");
  await evaluate(`document.querySelector('[aria-label="Switch to dark mode"]').click()`);
  await waitFor("document.documentElement.dataset.theme === 'dark' && localStorage.getItem('theme') === 'dark'", "color toggle");
  await evaluate(`document.querySelector('[aria-label="Switch to classic design"]').click()`);
  await waitFor("document.documentElement.dataset.design === 'classic' && localStorage.getItem('design') === 'classic'", "design toggle");
  assert.equal(await evaluate("document.querySelectorAll('#design-v2-styles').length"), 1);
  await evaluate(`document.querySelector('[aria-label="Switch to V2 design"]').click()`);
  await waitFor("document.documentElement.dataset.design === 'v2' && localStorage.getItem('design') === 'v2'", "design toggle back");
  assert.equal(await evaluate("document.querySelectorAll('#design-v2-styles').length"), 1);
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  await evaluate(`document.querySelector('#gallery [role="tablist"] button:nth-child(2)').click()`);
  await waitFor("document.querySelector('#gallery [role=tablist] button:nth-child(2)').getAttribute('aria-selected') === 'true'", "gallery filter");
  await evaluate(`document.querySelector('#gallery figure button').click()`);
  await waitFor("document.querySelector('#gallery [role=dialog]') !== null", "gallery dialog");
  await evaluate(`document.querySelector('#gallery [aria-label="Close photo viewer"]').click()`);
  await waitFor("document.querySelector('#gallery [role=dialog]') === null", "gallery close");
  await send("Page.navigate", { url: origin + "/blog" });
  await waitFor("location.pathname === '/blog' && document.querySelector('main') !== null", "blog links");
  const blogRoutes = await evaluate(`(() => {
    const paths = [...document.querySelectorAll('main a[href^="/blog/"]')].map(a => new URL(a.href).pathname);
    return [paths.find(path => path.split('/').length === 3), paths.find(path => path.split('/').length === 4)].filter(Boolean);
  })()`);
  const publicRoutes = ["/contact", "/blog", ...blogRoutes, "/privacy-policy", "/terms-and-conditions"];
  for (const width of [1280, 390]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 390 });
    for (const route of publicRoutes) {
      let classicType;
      for (const design of ["classic", "v2"]) {
        await evaluate(`localStorage.setItem('design', ${JSON.stringify(design)}); localStorage.setItem('theme', 'dark')`);
        await send("Page.navigate", { url: origin + route });
        await waitFor(`location.pathname === ${JSON.stringify(route)} && document.readyState !== 'loading' && document.querySelector('main') !== null && document.documentElement.dataset.design === ${JSON.stringify(design)}`, route);
        await waitFor("document.documentElement.dataset.design !== 'v2' || document.documentElement.dataset.designReady === 'true'", `${route} V2 CSS`);
        const type = await evaluate(typeSnapshot);
        if (design === "classic") classicType = type;
        else compareType(type, classicType, `${route} at ${width}px`);
        if (route === "/contact") assert.equal(await evaluate("document.querySelector('form') !== null"), true);
      }
    }
  }
  if (errors.length) console.log("Browser console messages:", errors);
  assert.deepEqual(errors.filter((error) => /hydration|uncaught|not found|failed to load/i.test(error)), []);
  console.log("Browser checks passed");
} finally {
  socket?.close();
  browser.kill();
  if (browser.exitCode === null) {
    await new Promise((resolve) => browser.once("exit", resolve));
  }
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
