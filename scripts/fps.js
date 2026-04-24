const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const screenshotPath = process.argv[3] || 'tmp/fps.png';

async function main() {
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--enable-gpu',
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(120_000);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => {
            const canvas = document.querySelector('.garden-bed-3d-model canvas');
            return Boolean(canvas && typeof canvas.dataset.engine === 'string');
        });
        await page.waitForFunction(() => typeof window.__fps !== 'undefined');

        const samples = 20;
        const takeSample = 15;
        let lastSample = 0;
        let validCount = 0;
        for (let i = 0; i < samples; i++) {
            const v = await page.evaluate(() => window.__fps);
            const n = Number(v);
            if (Number.isFinite(n) && validCount <= takeSample) {
                lastSample = n;
                validCount++;
            }
            console.log(`Sample ${i + 1}/${samples}: ${n}`);
            await page.waitForTimeout(1000);
        }
        console.log(`FPS_VALUE=${lastSample.toFixed(2)}`);
        const data = await page.evaluate(() => window.__scene_metrics);
        console.log(`SCENE_METRICS=${data}`);
        fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        await page.screenshot({
            path: screenshotPath,
            fullPage: true,
            timeout: 60_000,
        });
        console.log(`FPS_SCREENSHOT=${screenshotPath}`);
    } catch (err) {
        console.error('Failed to read window.__fps:', err.message || err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exitCode = 1;
});
