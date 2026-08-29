import { chromium } from 'playwright';

const url = process.env.QA_URL || 'http://127.0.0.1:3200/';
const browser = await chromium.launch({ headless: true });
const failures = [];
const evidence = {};

const rect = async (locator) => locator.evaluate((element) => {
  const bounds = element.getBoundingClientRect();
  return {
    top: Math.round(bounds.top),
    bottom: Math.round(bounds.bottom),
    left: Math.round(bounds.left),
    right: Math.round(bounds.right),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
    display: getComputedStyle(element).display,
    position: getComputedStyle(element).position,
    borderRadius: Math.round(Number.parseFloat(getComputedStyle(element).borderTopLeftRadius)),
  };
});

const auditShell = async ({ id, width, height, expectedShell }) => {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  await page.goto(`${url}#/home`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const sidebar = page.locator('aside[aria-label="Navegação principal"]');
  const header = page.locator('header.fixed');
  const bottomNav = page.locator('nav[aria-label="Navegação inferior"]');
  const sidebarBox = await rect(sidebar);
  const headerBox = await rect(header);
  const bottomBox = await rect(bottomNav);
  const triageLabel = await rect(sidebar.getByText('Triagem', { exact: true }));
  evidence[id] = { sidebar: sidebarBox, header: headerBox, bottomNav: bottomBox, triageLabel };

  if (expectedShell === 'compact') {
    if (sidebarBox.display !== 'none') failures.push(`${id}: a sidebar deve permanecer oculta`);
    if (headerBox.display === 'none') failures.push(`${id}: o header compacto deve permanecer visível`);
    if (bottomBox.display === 'none') failures.push(`${id}: a navegação inferior deve permanecer visível`);
  } else {
    if (sidebarBox.display === 'none' || sidebarBox.width < 220) failures.push(`${id}: a sidebar deve ser visível e ter largura útil`);
    if (triageLabel.width < 40 || triageLabel.height < 20 || triageLabel.position === 'absolute') failures.push(`${id}: os rótulos da sidebar devem estar legíveis`);
    if (headerBox.display !== 'none') failures.push(`${id}: o header compacto deve estar oculto`);
    if (bottomBox.display !== 'none') failures.push(`${id}: a navegação inferior deve estar oculta`);
  }
  await page.close();
};

await auditShell({ id: 'tablet-portrait', width: 768, height: 1024, expectedShell: 'compact' });
await auditShell({ id: 'tablet-landscape', width: 1024, height: 768, expectedShell: 'sidebar' });

{
  const page = await browser.newPage({ viewport: { width: 320, height: 568 }, reducedMotion: 'reduce' });
  await page.goto(`${url}#/home`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const cta = await rect(page.getByRole('button', { name: 'Iniciar triagem clínica' }));
  const hero = await rect(page.locator('section[aria-labelledby="triage-heading"]'));
  const bottomNav = await rect(page.getByRole('navigation', { name: 'Navegação inferior' }).locator(':scope > div'));
  evidence.mobileFirstFold = { cta, hero, bottomNav };
  if (cta.top < 64 || cta.bottom > bottomNav.top - 8) failures.push('mobile-small: o CTA principal deve estar completo e sem obstrução na primeira dobra');
  if (hero.bottom > bottomNav.top - 8) failures.push('mobile-small: o cartão de decisão deve terminar antes da navegação inferior');
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 390, height: 700 }, reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto(`${url}#/home`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const cta = await rect(page.getByRole('button', { name: 'Iniciar triagem clínica' }));
  const hero = await rect(page.locator('section[aria-labelledby="triage-heading"]'));
  const dock = await rect(page.getByRole('navigation', { name: 'Navegação inferior' }).locator(':scope > div'));
  evidence.mobileSafariShort = { cta, hero, dock };
  if (hero.bottom > dock.top - 8 || cta.bottom > dock.top - 8) failures.push('mobile-safari-short: conteúdo e CTA não podem ficar sob o dock de navegação');
  if (dock.left < 8 || dock.right > 382 || dock.borderRadius < 16) failures.push('mobile-safari-short: a navegação deve ser um dock flutuante com margens e cantos definidos');
  await page.close();
}

{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await page.goto(`${url}#/protocol-detail?protocol=p1`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => scrollTo(0, 700));
  await page.waitForTimeout(100);
  const globalHeader = await rect(page.locator('header.fixed'));
  const protocolHeader = await rect(page.locator('header.sticky'));
  evidence.mobileStickyHeader = { globalHeader, protocolHeader };
  if (protocolHeader.top < globalHeader.bottom) failures.push('mobile-protocol: o cabeçalho sticky do protocolo não pode cobrir o header global');
  await page.close();
}

await browser.close();

console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', failures, evidence }, null, 2));
if (failures.length) process.exitCode = 2;
