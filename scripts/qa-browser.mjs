import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const url = process.env.QA_URL || 'http://127.0.0.1:3200/';
const outputDir = process.env.QA_OUTPUT || '/tmp/sos-endo-browser-qa';
mkdirSync(outputDir, { recursive: true });

const viewports = [
  { id: 'mobile-small', width: 320, height: 568 },
  { id: 'mobile', width: 390, height: 844 },
  { id: 'mobile-short', width: 390, height: 700 },
  { id: 'tablet-portrait', width: 768, height: 1024 },
  { id: 'tablet-landscape', width: 1024, height: 768 },
  { id: 'desktop', width: 1440, height: 1000 },
];

const browser = await chromium.launch({ headless: true });
const report = { url, viewports: [], surfaces: [], flows: {}, status: 'PASS' };

const inspectPage = async (page, screenshot) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(220);
  await page.screenshot({ path: screenshot, animations: 'disabled' });
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length, targets: item.nodes.slice(0, 8).map((node) => ({ target: node.target, summary: node.failureSummary })) })));
  const layout = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 }));
  return { screenshot, violations, layout };
};

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, locale: 'pt-BR', reducedMotion: 'reduce', colorScheme: 'light' });
  const page = await context.newPage();
  const consoleErrors = [];
  const requestFailures = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(String(error)));
  page.on('requestfailed', (request) => requestFailures.push({ url: request.url(), reason: request.failure()?.errorText }));
  page.on('response', (response) => { if (response.status() >= 400) requestFailures.push({ url: response.url(), reason: `HTTP ${response.status()}` }); });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(450);
  const screenshot = join(outputDir, `${viewport.id}-home.png`);
  await page.screenshot({ path: screenshot, animations: 'disabled' });
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length, targets: item.nodes.slice(0, 8).map((node) => ({ target: node.target, summary: node.failureSummary })) })));
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    clientHeight: document.documentElement.clientHeight,
    scrollHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  }));
  report.viewports.push({ id: viewport.id, width: viewport.width, height: viewport.height, screenshot, layout, consoleErrors, requestFailures, violations });
  if (layout.horizontalOverflow || consoleErrors.length || requestFailures.length || violations.length) report.status = 'FAIL';
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('searchbox').fill('Quanto tempo a dor leva');
  await page.getByRole('button', { name: 'FAQ: Quanto tempo a dor leva para passar?' }).click();
  report.flows.searchToFaq = {
    hash: await page.evaluate(() => location.hash),
    faqSelected: await page.getByRole('tab', { name: 'FAQ' }).getAttribute('aria-selected'),
  };

  await page.goto(`${url}#/diagnosis`, { waitUntil: 'domcontentloaded' });
  for (let step = 0; step < 6; step += 1) await page.getByRole('button', { name: 'Responder não e avançar' }).click();
  await page.getByRole('button', { name: 'Responder não e concluir triagem' }).click();
  report.flows.triage = { heading: await page.getByRole('heading', { name: 'Hipótese clínica sugerida' }).innerText(), screenshot: join(outputDir, 'mobile-triage-summary.png') };
  await page.screenshot({ path: report.flows.triage.screenshot, animations: 'disabled' });

  await page.goto(`${url}#/protocol-detail?protocol=p1`, { waitUntil: 'domcontentloaded' });
  report.flows.protocol = { checkboxes: await page.getByRole('checkbox').count(), timerOptions: await page.getByRole('button', { name: /Iniciar \d+ min/ }).count() };

  await page.goto(`${url}#/prescriptions`, { waitUntil: 'domcontentloaded' });
  const acknowledgement = page.getByRole('checkbox', { name: /Revisei alergias, contraindicações/ }).first();
  const copyButton = page.getByRole('button', { name: /Copiar modelo de prescrição/ }).first();
  const disabledBefore = await copyButton.isDisabled();
  await acknowledgement.check();
  await copyButton.click();
  await page.getByText(/Modelo copiado/).waitFor({ state: 'visible' });
  report.flows.prescription = { disabledBefore, successToast: await page.getByText(/Modelo copiado/).isVisible() };

  await page.goto(`${url}#/references?tab=operational`, { waitUntil: 'domcontentloaded' });
  const price = page.getByLabel('Preço estimado (R$)');
  await price.fill('0');
  report.flows.calculator = { zeroPriceError: await page.getByRole('alert').innerText() };
  await context.close();
}

for (const viewport of [{ id: 'mobile', width: 390, height: 844 }, { id: 'tablet', width: 768, height: 1024 }]) {
  const context = await browser.newContext({ viewport, locale: 'pt-BR', reducedMotion: 'reduce', colorScheme: 'light' });
  const page = await context.newPage();
  for (const surface of [
    ['protocols', '#/protocols'],
    ['protocol-detail', '#/protocol-detail?protocol=p1'],
    ['prescriptions', '#/prescriptions'],
    ['communication', '#/scripts'],
    ['references-decision', '#/references?tab=decision'],
    ['references-operational', '#/references?tab=operational'],
    ['references-checklist', '#/references?tab=checklist'],
    ['references-faq', '#/references?tab=faq'],
    ['method', '#/manifesto'],
    ['triage-start', '#/diagnosis'],
  ]) {
    await page.goto(`${url}${surface[1]}`, { waitUntil: 'domcontentloaded' });
    const inspection = await inspectPage(page, join(outputDir, `${viewport.id}-${surface[0]}.png`));
    report.surfaces.push({ viewport: viewport.id, surface: surface[0], ...inspection });
    if (inspection.layout.horizontalOverflow || inspection.violations.length) report.status = 'FAIL';
  }
  await context.close();
}

for (const viewport of [{ id: 'mobile-dark', width: 390, height: 844 }, { id: 'desktop-dark', width: 1440, height: 1000 }]) {
  const context = await browser.newContext({ viewport, locale: 'pt-BR', colorScheme: 'dark', reducedMotion: 'reduce' });
  await context.addInitScript(() => localStorage.setItem('theme', 'dark'));
  const page = await context.newPage();
  for (const surface of [
    ['home', '#/home'],
    ['protocol-detail', '#/protocol-detail?protocol=p1'],
    ['prescriptions', '#/prescriptions'],
    ['references-operational', '#/references?tab=operational'],
    ['triage-start', '#/diagnosis'],
  ]) {
    await page.goto(`${url}${surface[1]}`, { waitUntil: 'domcontentloaded' });
    const inspection = await inspectPage(page, join(outputDir, `${viewport.id}-${surface[0]}.png`));
    report.surfaces.push({ viewport: viewport.id, surface: surface[0], ...inspection });
    if (inspection.layout.horizontalOverflow || inspection.violations.length) report.status = 'FAIL';
  }
  await context.close();
}

await browser.close();
if (report.flows.searchToFaq.faqSelected !== 'true' || report.flows.protocol.checkboxes !== 4 || !report.flows.prescription.disabledBefore || !report.flows.prescription.successToast || !report.flows.calculator.zeroPriceError.includes('maior que zero')) report.status = 'FAIL';
writeFileSync(join(outputDir, 'qa-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: report.status, outputDir, viewports: report.viewports.length, surfaces: report.surfaces.length, flows: Object.keys(report.flows) }, null, 2));
if (report.status !== 'PASS') process.exitCode = 2;
