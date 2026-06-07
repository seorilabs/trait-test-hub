import { writeFileSync } from 'node:fs';

const cdpPort = Number(process.env.CDP_PORT ?? 9228);
const previewUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4173/';
const screenshotPath = process.env.SCREENSHOT_PATH ?? 'tmp/trait-test-dpti-result-mobile.png';

const targets = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then((response) => response.json());
const page = targets.find((target) => target.type === 'page');
if (!page) {
  throw new Error('No Chrome page target found');
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const messageId = ++id;
    pending.set(messageId, { resolve, reject });
    ws.send(JSON.stringify({ id: messageId, method, params }));
  });

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) {
    return;
  }
  const callbacks = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) {
    callbacks.reject(new Error(JSON.stringify(message.error)));
    return;
  }
  callbacks.resolve(message.result);
});

await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await send('Page.navigate', { url: `${previewUrl}?dpti-flow=1` });
await wait(800);

const home = await evaluateJson(
  'JSON.stringify({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, text: document.body.innerText.slice(0, 220), hasDpti: document.body.innerText.includes("DPTI 개발자 성향 테스트"), hasDefaultFilterPanel: !!document.querySelector(".filter-panel") })',
);
if (!home.hasDpti) {
  throw new Error('DPTI home content was not rendered');
}
if (home.hasDefaultFilterPanel) {
  throw new Error('Filter panel should stay collapsed by default');
}
if (home.scrollWidth > home.innerWidth) {
  throw new Error(`Mobile overflow detected on home: ${home.scrollWidth} > ${home.innerWidth}`);
}

await click('[data-action="select-test"][data-test-id="dpti"]');
await wait(80);
await click('[data-action="start"]');
for (let index = 0; index < 16; index += 1) {
  await wait(40);
  await click('[data-action="answer"]');
}
await wait(500);

const result = await evaluateJson(
  'JSON.stringify({ text: document.body.innerText.slice(0, 360), hasImage: !!document.querySelector(".result-image"), imageComplete: document.querySelector(".result-image")?.complete ?? false, innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth })',
);
if (!result.text.includes('독립적 코드 아키텍트')) {
  throw new Error(`Unexpected result screen: ${result.text}`);
}
if (!result.hasImage || !result.imageComplete) {
  throw new Error('DPTI result image did not load');
}
if (result.scrollWidth > result.innerWidth) {
  throw new Error(`Mobile overflow detected on result: ${result.scrollWidth} > ${result.innerWidth}`);
}

const screenshot = await send('Page.captureScreenshot', {
  format: 'png',
  captureBeyondViewport: false,
});
writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
ws.close();

console.log(
  JSON.stringify(
    {
      home,
      result,
      screenshotPath,
    },
    null,
    2,
  ),
);

async function click(selector) {
  const expression = `
    (() => {
      const target = document.querySelector(${JSON.stringify(selector)});
      if (!target) return false;
      target.click();
      return true;
    })()
  `;
  const result = await send('Runtime.evaluate', { expression, returnByValue: true });
  if (result.result.value !== true) {
    throw new Error(`Cannot click selector: ${selector}`);
  }
}

async function evaluateJson(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true });
  return JSON.parse(result.result.value);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
