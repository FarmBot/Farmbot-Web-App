const stressResourceTimeoutMs = 180_000;
const stressResourceSettleMs = 5_000;

const productLineFromUrl = value => new URL(value).searchParams.get('productLine');

const stressResourceCountFromProductLine = productLine => {
    const match = productLine && productLine.match(/_stress_(\d+)$/);
    return match ? Number(match[1]) : undefined;
};

const stressResourceCountFromUrl = value =>
    stressResourceCountFromProductLine(productLineFromUrl(value));

const isStressTryFarmbotUrl = value =>
    new URL(value).pathname.includes('/try_farmbot')
    && Number.isFinite(stressResourceCountFromUrl(value));

const appUrlFor = value => new URL('/app/designer/plants', value).toString();

const waitForStressResources = async (page, stressResourceCount) => {
    await page.waitForFunction(() => localStorage.getItem('session'), {
        timeout: stressResourceTimeoutMs,
    });
    await page.waitForFunction(async expected => {
        const session = JSON.parse(localStorage.getItem('session'));
        const headers = { Authorization: session.token.encoded };
        const json = path => fetch(path, { headers }).then(response => {
            if (!response.ok) { throw new Error(`${response.status} ${path}`); }
            return response.json();
        });
        const [points, images, sensorReadings] = await Promise.all([
            json('/api/points'),
            json('/api/images'),
            json('/api/sensor_readings'),
        ]);
        const plants = points.filter(point => point.pointer_type == 'Plant').length;
        const weeds = points.filter(point => point.pointer_type == 'Weed').length;
        const soilHeightPoints = points
            .filter(point => point.name == 'Soil Height').length;
        return plants >= expected
            && weeds >= expected
            && soilHeightPoints >= expected
            && images.length >= expected
            && sensorReadings.length >= expected;
    }, stressResourceCount, { timeout: stressResourceTimeoutMs });
};

const prepareStressResources = async (page, url) => {
    if (!isStressTryFarmbotUrl(url)) { return; }
    const stressResourceCount = stressResourceCountFromUrl(url);
    console.log(`Waiting for ${stressResourceCount} stress resources...`);
    await waitForStressResources(page, stressResourceCount);
    console.log(`Stress resources found. Waiting ${stressResourceSettleMs}ms...`);
    await page.waitForTimeout(stressResourceSettleMs);
    const appUrl = appUrlFor(url);
    console.log(`Stress resources loaded. Navigating to ${appUrl}`);
    await page.goto(appUrl, { waitUntil: 'domcontentloaded' });
};

module.exports = {
    prepareStressResources,
};
