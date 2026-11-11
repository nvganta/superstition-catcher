/**
 * Minimal smoke runner. Requires: npm i -D playwright && npx playwright install chromium
 * Usage: BASE_URL=http://127.0.0.1:3000 npx tsx playwright-minimal.example.ts
 */
import { chromium } from 'playwright';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const outDir = process.env.ARTIFACT_DIR ?? './artifacts/screenshots';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base);
  await page.screenshot({ path: `${outDir}/home-desktop.png`, fullPage: true });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
