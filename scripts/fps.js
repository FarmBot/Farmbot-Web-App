const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { saveFpsPlot } = require('./fps_plot');

const url = process.argv[2];
const screenshotPath = process.argv[3] || 'tmp/fps.png';
const plotPath = process.argv[4] || 'tmp/fps_plot.png';
const maxLoadingSamples = 240;
const postLoadSamples = 10;
const chosenPostLoadSample = 5;
const sampleIntervalMs = 1000;

const pageIsLoading = page =>
    page.evaluate(() => Boolean(document.querySelector('.three-d-load-progress')));

function printUsage() {
    console.log([
        'Usage: bun scripts/fps.js <url> [screenshot_path] [fps_plot_path]',
        '',
        'Arguments:',
        '  url              Page URL that exposes window.__fps and window.__scene_metrics.',
        '  screenshot_path  Optional full-page screenshot PNG path. Default: tmp/fps.png',
        '  fps_plot_path    Optional FPS plot PNG path. Default: tmp/fps_plot.png',
    ].join('\n'));
}

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
        await page.waitForFunction(() => typeof window.__fps !== 'undefined');

        let lastSample = 0;
        let lastSampleIndex = -1;
        let loadingSampleCount = 0;
        let postLoadCount = 0;
        const sampleValues = [];
        let loading = true;
        const maxSamples = maxLoadingSamples + postLoadSamples;
        const startMs = Date.now();
        for (let i = 0; i < maxSamples; i++) {
            const v = await page.evaluate(() => window.__fps);
            const n = Number(v);
            const elapsedSeconds = (Date.now() - startMs) / 1000;
            loading = await pageIsLoading(page);
            sampleValues.push({ fps: n, elapsedSeconds, loading });
            if (loading) {
                loadingSampleCount++;
            } else {
                postLoadCount++;
                if (postLoadCount === chosenPostLoadSample) {
                    lastSample = n;
                    lastSampleIndex = i;
                }
            }
            const status = loading
                ? 'loading'
                : `loaded ${postLoadCount}/${postLoadSamples}`;
            console.log(`Sample ${i + 1} (${status}, ${elapsedSeconds.toFixed(2)}s): ${n.toFixed(2)}fps`);
            if (postLoadCount >= postLoadSamples) { break; }
            if (loadingSampleCount >= maxLoadingSamples) { break; }
            await page.waitForTimeout(sampleIntervalMs);
        }
        if (loading) {
            throw new Error(`3D load did not finish after ${sampleValues.length} samples`);
        }
        if (!Number.isFinite(lastSample)) {
            throw new Error(`Post-load sample ${chosenPostLoadSample} was not a valid FPS value`);
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
        await saveFpsPlot(browser, sampleValues, plotPath, {
            highlightIndex: lastSampleIndex,
        });
        console.log(`FPS_PLOT=${plotPath}`);
    } catch (err) {
        console.error('Failed to read window.__fps:', err.message || err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

if (!url || url === '-h' || url === '--help') {
    printUsage();
    process.exitCode = url ? 0 : 1;
} else {
    main().catch((err) => {
        console.error('Unexpected error:', err);
        process.exitCode = 1;
    });
}
