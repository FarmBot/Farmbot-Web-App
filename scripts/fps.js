const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const url = process.argv[2];
const screenshotPath = process.argv[3] || '/tmp/fps.png';
const samplesCsvPath = process.argv[4] || '/tmp/fps_samples.csv';
const maxLoadingSamples = 240;
const postLoadSamples = 10;
const chosenPostLoadSample = 5;
const sampleIntervalMs = 1000;
const ci = Boolean(process.env.CI);
const openWindow = Boolean(process.env.DISPLAY && process.env.OPEN_WINDOW);
const chromiumArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--ignore-gpu-blocklist',
    '--disable-frame-rate-limit',
    '--disable-gpu-vsync',
    '--enable-features=Vulkan',
    '--use-gl=angle',
    '--enable-gpu-rasterization',
    '--enable-zero-copy',
    ...((openWindow && !ci) ? [] : ['--use-angle=vulkan']),
];

const pageIsLoading = page =>
    page.evaluate(() => Boolean(document.querySelector('.three-d-load-progress')));

const webglRenderer = page =>
    page.evaluate(() => {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) { return { status: 'unavailable' }; }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) { return { status: 'available' }; }

        return {
            status: 'available',
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
        };
    });

function printUsage() {
    console.log([
        'Usage: bun scripts/fps.js <url> [screenshot_path] [fps_samples_csv_path]',
        '',
        'Arguments:',
        '  url                   Page URL that exposes window.__fps and window.__scene_metrics.',
        '  screenshot_path       Optional full-page screenshot PNG path. Default: /tmp/fps.png',
        '  fps_samples_csv_path  Optional FPS samples CSV path. Default: /tmp/fps_samples.csv',
    ].join('\n'));
}

const csvField = value => {
    const stringValue = String(value);
    return /[",\n\r]/.test(stringValue)
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
};

function saveFpsSamplesCsv(samples, destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const rows = [
        ['elapsed seconds', 'fps', 'loading', 'chosen'],
        ...samples.map(sample => [
            Number(sample.elapsedSeconds).toFixed(3),
            Number(sample.fps).toFixed(2),
            sample.loading ? 'true' : 'false',
            sample.chosen ? 'true' : 'false',
        ]),
    ];
    fs.writeFileSync(destination, `${rows
        .map(row => row.map(csvField).join(','))
        .join('\n')}\n`);
}

async function main() {
    console.log(`Launching Chromium with args: ${chromiumArgs.join(' ')}`);
    const browser = await chromium.launch({
        headless: !openWindow,
        args: chromiumArgs,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(120_000);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const renderer = await webglRenderer(page);
        console.log(`WEBGL_STATUS=${renderer.status}`);
        if (renderer.vendor) { console.log(`WEBGL_VENDOR=${renderer.vendor}`); }
        if (renderer.renderer) { console.log(`WEBGL_RENDERER=${renderer.renderer}`); }
        await page.waitForFunction(() => typeof window.__fps !== 'undefined');

        let lastSample = 0;
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
            let chosen = false;
            if (loading) {
                loadingSampleCount++;
            } else {
                postLoadCount++;
                if (postLoadCount === chosenPostLoadSample) {
                    lastSample = n;
                    chosen = true;
                }
            }
            const sample = { fps: n, elapsedSeconds, loading, chosen };
            sampleValues.push(sample);
            const status = loading
                ? 'loading'
                : `loaded ${postLoadCount}/${postLoadSamples}`;
            const chosenMarker = chosen ? ' <---' : '';
            console.log(`Sample ${i + 1} (${status}, ${elapsedSeconds.toFixed(2)}s): ${n.toFixed(2)}fps${chosenMarker}`);
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
        saveFpsSamplesCsv(sampleValues, samplesCsvPath);
        console.log(`FPS_SAMPLES_CSV=${samplesCsvPath}`);
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
