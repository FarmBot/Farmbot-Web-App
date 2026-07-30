const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { prepareStressResources } = require('./fps_stress_resources');

function parseArgs(argv) {
    const options = {
        screenshotPath: '/tmp/fps.png',
        samplesCsvPath: '/tmp/fps_samples.csv',
        screenshotOnly: false,
        screenshot3dOnly: false,
        waitFor3d: false,
    };
    const valueOptions = {
        '--name': 'name',
        '--url': 'url',
        '--screenshot-path': 'screenshotPath',
        '--fps-samples-path': 'samplesCsvPath',
        '--actions': 'actions',
        '--state': 'state',
        '--roi': 'roi',
        '--zoom': 'zoom',
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '-h' || arg === '--help') {
            options.help = true;
            continue;
        }
        if (arg === '--screenshot-only') {
            options.screenshotOnly = true;
            continue;
        }
        if (arg === '--screenshot-3d-only') {
            options.screenshot3dOnly = true;
            continue;
        }
        if (arg === '--wait-for-3d') {
            options.waitFor3d = true;
            continue;
        }
        const optionName = valueOptions[arg];
        if (!optionName) { throw new Error(`Unknown argument: ${arg}`); }
        const value = argv[i + 1];
        if (!value || value.startsWith('--')) {
            throw new Error(`Missing value for ${arg}`);
        }
        options[optionName] = value;
        i++;
    }

    return options;
}

const options = parseArgs(process.argv.slice(2));
const name = options.name;
const url = options.url;
const screenshotPath = options.screenshotPath;
const samplesCsvPath = options.samplesCsvPath;
const screenshot3dOnly = options.screenshot3dOnly;
const maxLoadingSamples = 240;
const postLoadSamples = screenshot3dOnly ? 1 : 10;
const sampleIntervalMs = 1000;
const defaultActionTimeoutMs = 5000;
const ci = Boolean(process.env.CI);
const openWindow = Boolean(process.env.DISPLAY && process.env.OPEN_WINDOW);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const screenshotOnly = options.screenshotOnly;
const waitFor3d = options.waitFor3d;
const zoom = options.zoom === undefined ? undefined : Number(options.zoom);
if (zoom !== undefined && !Number.isFinite(zoom)) {
    throw new Error(`Zoom must be a finite number: ${options.zoom}`);
}
const actions = options.actions ? JSON.parse(options.actions) : [];
const roi = options.roi ? JSON.parse(options.roi) : undefined;
const roiScale = (() => {
    if (!roi) { return undefined; }
    const value = Number(roi.scale || 2);
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`ROI scale must be a positive number: ${JSON.stringify(roi)}`);
    }
    return value;
})();
const state = options.state ? path.join('/tmp', `${options.state}.json`) : undefined;
const saveState = path.join('/tmp', `${name}.json`);
const commitSha = () => {
    const sha = process.env.GITHUB_SHA
        || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    return sha.slice(0, 10);
};
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
        'Usage: bun scripts/fps.js --name <name> --url <url> [options]',
        '',
        'Options:',
        '  --name <name>                          Scenario name used for storage state output.',
        '  --url <url>                            Page URL that exposes window.__fps and window.__scene_metrics.',
        '  --screenshot-path <path>               Full-page screenshot PNG path. Default: /tmp/fps.png',
        '  --fps-samples-path <path>              FPS samples CSV path. Default: /tmp/fps_samples.csv',
        '  --screenshot-only                      Take a screenshot without FPS metrics.',
        '  --screenshot-3d-only                   Take a screenshot of 3D scene without saving FPS metrics.',
        '  --wait-for-3d                          Wait for 3D loading before taking screenshots.',
        '  --zoom <value>                         Adjust 3D zoom before screenshots; positive values zoom out.',
        '  --actions <json>                       Perform ordered actions after page load.',
        '  --state <name>                         Load cookies and localStorage from /tmp/<name>.json.',
        '  --roi <json>                           Crop screenshots to {x,y,width,height}.',
        '',
        'Environment:',
        '  CI                                    Use CI browser launch behavior.',
        '  DISPLAY                               Display server used for headed local runs.',
        '  OPEN_WINDOW                           Open a visible browser window when DISPLAY is set.',
        '  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH   Path to a Chrome/Chromium binary.',
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
    const sha = commitSha();
    const rows = [
        ['elapsed seconds', 'fps', 'loading', 'averaged', 'commit sha'],
        ...samples.map(sample => [
            Number(sample.elapsedSeconds).toFixed(3),
            Number(sample.fps).toFixed(2),
            sample.loading ? 'true' : 'false',
            sample.averaged ? 'true' : 'false',
            sha,
        ]),
    ];
    fs.writeFileSync(destination, `${rows
        .map(row => row.map(csvField).join(','))
        .join('\n')}\n`);
}

async function saveStorage(page) {
    fs.mkdirSync(path.dirname(saveState), { recursive: true });
    await page.context().storageState({ path: saveState });
    console.log(`SAVE_STATE=${saveState}`);
}

function actionValue(action, type, keys = []) {
    const value = action[type];
    if (typeof value === 'object' && value !== null) {
        for (const key of keys) {
            if (value[key]) { return value[key]; }
        }
    }
    return value;
}

function stringActionValue(action, type, keys = []) {
    const value = actionValue(action, type, keys);
    if (typeof value !== 'string') {
        throw new Error(`${type} action requires a string value: ${JSON.stringify(action)}`);
    }
    return value;
}

function actionTimeout(action) {
    const timeout = action.timeout || action.timeoutMs || defaultActionTimeoutMs;
    const parsedTimeout = Number(timeout);
    if (!Number.isFinite(parsedTimeout) || parsedTimeout <= 0) {
        throw new Error(`Action timeout must be a positive number: ${JSON.stringify(action)}`);
    }
    return parsedTimeout;
}

async function performAction(page, action) {
    const timeout = actionTimeout(action);
    if (action.click) {
        const title = stringActionValue(action, 'click', ['title']);
        await page.getByTitle(title).click({ timeout });
        console.log(`CLICK=${title}`);
        return;
    }

    if (action.fill) {
        const placeholder = action.placeholder || stringActionValue(action, 'fill', ['placeholder']);
        const value = action.value || action.text || stringActionValue(action, 'fill', ['value', 'text']);
        await page.getByPlaceholder(placeholder).fill(value, { timeout });
        console.log(`FILL=${placeholder}`);
        return;
    }

    if (action.hover) {
        const className = action.classname
            || action.class
            || action.className
            || stringActionValue(action, 'hover', ['classname', 'class', 'className']);
        const selector = className.startsWith('.') ? className : `.${className}`;
        await page.locator(selector).first().hover({ timeout });
        console.log(`HOVER=${className}`);
        return;
    }

    throw new Error(`Unknown action: ${JSON.stringify(action)}`);
}

function screenshotOptions(destination) {
    const screenshot = {
        path: destination,
        fullPage: true,
        timeout: 60_000,
    };
    if (!roi) { return screenshot; }

    const clip = {};
    for (const key of ['x', 'y', 'width', 'height']) {
        const value = Number(roi[key]);
        if (!Number.isFinite(value)) {
            throw new Error(`ROI ${key} must be a finite number: ${JSON.stringify(roi)}`);
        }
        clip[key] = value;
    }
    if (clip.width <= 0 || clip.height <= 0 || clip.x < 0 || clip.y < 0) {
        throw new Error(`ROI must have non-negative x/y and positive width/height: ${JSON.stringify(roi)}`);
    }
    delete screenshot.fullPage;
    screenshot.clip = clip;
    return screenshot;
}

async function saveScreenshot(page, destination, label) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    await page.screenshot(screenshotOptions(destination));
    console.log(`${label}=${destination}`);
}

async function waitFor3DLoad(page) {
    await page.waitForFunction(() => typeof window.__fps !== 'undefined');
    let loadedSeen = false;
    for (let i = 0; i < maxLoadingSamples; i++) {
        const loading = await pageIsLoading(page);
        if (loading) {
            loadedSeen = false;
        } else if (loadedSeen) {
            console.log('3D_LOAD_COMPLETE=true');
            return;
        } else {
            loadedSeen = true;
        }
        await page.waitForTimeout(sampleIntervalMs);
    }
    throw new Error(`3D load did not finish after ${maxLoadingSamples} samples`);
}

async function adjust3DZoom(page, value) {
    await page.locator('.garden-bed-3d-model canvas').first().hover();
    const stepCount = Math.min(
        Math.max(Math.ceil(Math.abs(value) / 100), 1),
        100,
    );
    const stepValue = value / stepCount;
    for (let step = 0; step < stepCount; step++) {
        await page.mouse.wheel(0, stepValue);
        await page.waitForTimeout(20);
    }
    await page.waitForTimeout(500);
    console.log(`3D_ZOOM=${value}`);
}

function actionScreenshotPath(index) {
    const extension = path.extname(screenshotPath);
    const basePath = extension
        ? screenshotPath.slice(0, -extension.length)
        : screenshotPath;
    return `${basePath}_action_${index + 1}${extension}`;
}

async function performScreenshotAction(page, action, destination) {
    await performAction(page, action);
    if (waitFor3d) {
        await waitFor3DLoad(page);
    } else {
        await page.waitForTimeout(1000);
    }
    await saveScreenshot(page, destination, 'ACTION_SCREENSHOT');
}

async function main() {
    console.log(`Launching Chromium with args:\n  ${chromiumArgs.join('\n  ')}\n`);
    if (executablePath) {
        console.log(`CHROMIUM_EXECUTABLE_PATH=${executablePath}`);
    }
    const browser = await chromium.launch({
        headless: !openWindow,
        executablePath,
        args: chromiumArgs,
    });
    const contextOptions = {
        ...(state ? { storageState: state } : {}),
        ...(roiScale ? { deviceScaleFactor: roiScale } : {}),
    };
    if (state) {
        console.log(`STATE=${state}`);
    }
    const context = await browser.newContext(contextOptions);
    await context.addInitScript(() => localStorage.setItem('FPS_LOGS', 'true'));
    const page = await context.newPage();
    page.setDefaultTimeout(60_000);
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await prepareStressResources(page, url);
        if (screenshotOnly && (waitFor3d || zoom !== undefined)) {
            await waitFor3DLoad(page);
        }
        if (screenshotOnly && zoom !== undefined) {
            await adjust3DZoom(page, zoom);
        }
        for (const [index, action] of actions.entries()) {
            if (screenshotOnly) {
                await performScreenshotAction(page, action, actionScreenshotPath(index));
            } else {
                await performAction(page, action);
            }
        }
        if (screenshotOnly) {
            if (actions.length === 0) {
                if (!waitFor3d) {
                    await page.waitForTimeout(1000);
                }
                await saveScreenshot(page, screenshotPath, 'SCREENSHOT');
            }
            return;
        }
        const renderer = await webglRenderer(page);
        console.log(`WEBGL_STATUS=${renderer.status}`);
        if (renderer.vendor) { console.log(`WEBGL_VENDOR=${renderer.vendor}`); }
        if (renderer.renderer) { console.log(`WEBGL_RENDERER=${renderer.renderer}`); }
        await page.waitForFunction(() => typeof window.__fps !== 'undefined');

        let averagePostLoadSample = 0;
        let loadingSampleCount = 0;
        let postLoadCount = 0;
        const postLoadValues = [];
        const sampleValues = [];
        let loading = true;
        const maxSamples = maxLoadingSamples + postLoadSamples;
        const startMs = Date.now();
        let loadedSeen = false;
        for (let i = 0; i < maxSamples; i++) {
            const v = await page.evaluate(() => window.__fps);
            const n = Number(v);
            const elapsedSeconds = (Date.now() - startMs) / 1000;
            const pageLoading = await pageIsLoading(page);
            if (pageLoading) {
                loadedSeen = false;
                loading = true;
            } else {
                loading = !loadedSeen;
                loadedSeen = true;
            }
            let averaged = false;
            if (loading) {
                loadingSampleCount++;
            } else {
                postLoadCount++;
                postLoadValues.push(n);
                averaged = true;
            }
            const sample = {
                fps: n,
                elapsedSeconds,
                loading,
                averaged,
            };
            sampleValues.push(sample);
            const status = loading
                ? 'loading'
                : `loaded ${postLoadCount}/${postLoadSamples}`;
            const averagedMarker = averaged ? ' <---' : '';
            console.log(`Sample ${i + 1} (${status}, ${elapsedSeconds.toFixed(2)}s): ${n.toFixed(2)}fps${averagedMarker}`);
            if (postLoadCount >= postLoadSamples) { break; }
            if (loadingSampleCount >= maxLoadingSamples) { break; }
            await page.waitForTimeout(sampleIntervalMs);
        }
        if (loading) {
            throw new Error(`3D load did not finish after ${sampleValues.length} samples`);
        }

        averagePostLoadSample =
            postLoadValues.reduce((total, value) => total + value, 0)
            / postLoadValues.length;
        if (!Number.isFinite(averagePostLoadSample)) {
            throw new Error('Average post-load FPS was not a valid value');
        }
        console.log(`FPS_VALUE=${averagePostLoadSample.toFixed(2)}`);
        console.log(`LOAD_DURATION=${sampleValues.find(s => !s.loading)?.elapsedSeconds.toFixed(2) || 'unknown'}`);
        const data = await page.evaluate(() => window.__scene_metrics);
        if (!data || data === 'undefined') {
            throw new Error('window.__scene_metrics was not available');
        }
        console.log(`SCENE_METRICS=${data}`);
        await saveScreenshot(page, screenshotPath, 'FPS_SCREENSHOT');
        if (!screenshot3dOnly) {
            saveFpsSamplesCsv(sampleValues, samplesCsvPath);
            console.log(`FPS_SAMPLES_CSV=${samplesCsvPath}`);
        }
        await saveStorage(page);
    } catch (err) {
        console.error('Render failed:', err.message || err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

if (options.help) {
    printUsage();
    process.exitCode = 0;
} else if (!name || !url) {
    printUsage();
    process.exitCode = 1;
} else {
    main().catch((err) => {
        console.error('Unexpected error:', err);
        process.exitCode = 1;
    });
}
