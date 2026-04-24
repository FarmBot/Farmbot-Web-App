const fs = require('fs');
const path = require('path');

const formatStat = value => value.toFixed(2);
const formatPoint = value => Number(value.toFixed(2));
const finiteSamples = samples => samples
    .map((sample, index) => {
        const value = typeof sample === 'object' ? sample.fps : sample;
        const elapsedSeconds = typeof sample === 'object'
            ? Number(sample.elapsedSeconds)
            : index;
        return {
            value: Number(value),
            elapsedSeconds,
            index,
            loading: typeof sample === 'object' ? sample.loading : undefined,
        };
    })
    .filter(({ value }) => Number.isFinite(value));

function buildFpsPlotSvg(samples, options = {}) {
    const width = options.width || 640;
    const height = options.height || 320;
    const highlightIndex = options.highlightIndex;
    const margin = { top: 52, right: 24, bottom: 44, left: 54 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const finite = finiteSamples(samples);
    const values = finite.map(({ value }) => value);
    const times = finite
        .map(({ elapsedSeconds }) => elapsedSeconds)
        .filter(value => Number.isFinite(value));
    const minSample = values.length ? Math.min(...values) : 0;
    const maxSample = values.length ? Math.max(...values) : 0;
    const avgSample = values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0;
    const lastSample = values.length ? values[values.length - 1] : 0;
    const minValue = Math.min(0, minSample);
    const maxValue = Math.max(1, maxSample);
    const valueRange = maxValue - minValue || 1;
    const minTime = 0;
    const maxTime = Math.max(1, times.length ? Math.max(...times) : samples.length - 1);
    const timeRange = maxTime - minTime || 1;
    const xFor = elapsedSeconds => margin.left + (
        (elapsedSeconds - minTime) / timeRange
    ) * plotWidth;
    const yFor = value => margin.top + ((maxValue - value) / valueRange) * plotHeight;
    const points = finite
        .map(({ value, elapsedSeconds }) =>
            `${formatPoint(xFor(elapsedSeconds))},${formatPoint(yFor(value))}`)
        .join(' ');
    const circles = finite
        .map(({ value, elapsedSeconds, index }) => {
            const highlighted = index === highlightIndex;
            return [
                `<circle cx="${formatPoint(xFor(elapsedSeconds))}" cy="${formatPoint(yFor(value))}"`,
                ` r="${highlighted ? 5 : 3}" fill="${highlighted ? '#f97316' : '#0969da'}" />`,
            ].join('');
        })
        .join('');
    const gridValues = [maxValue, (maxValue + minValue) / 2, minValue];
    const grid = gridValues
        .map(value => {
            const y = formatPoint(yFor(value));
            return [
                `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#d0d7de" />`,
                `<text x="${margin.left - 10}" y="${formatPoint(y + 4)}" text-anchor="end" fill="#57606a" font-size="12">${formatStat(value)}</text>`,
            ].join('');
        })
        .join('');
    const tickInterval = maxTime <= 10 ? 1 : maxTime <= 100 ? 10 : 100;
    const xTicks = Array.from({ length: Math.floor(maxTime / tickInterval) + 1 },
        (_value, index) => {
            const elapsedSeconds = index * tickInterval;
            const x = formatPoint(xFor(elapsedSeconds));
            return [
                `<line x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 5}" stroke="#8c959f" />`,
                `<text x="${x}" y="${height - 22}" text-anchor="middle" fill="#57606a" font-family="Arial, sans-serif" font-size="10">${elapsedSeconds}</text>`,
            ].join('');
        })
        .join('');
    const firstLoaded = finite.find(({ loading }) => loading === false);
    const loadedMarker = firstLoaded
        ? [
            `<line x1="${formatPoint(xFor(firstLoaded.elapsedSeconds))}" y1="${margin.top}" x2="${formatPoint(xFor(firstLoaded.elapsedSeconds))}" y2="${height - margin.bottom}" stroke="#f97316" stroke-width="2" stroke-dasharray="5 4" />`,
            `<text x="${formatPoint(xFor(firstLoaded.elapsedSeconds) + 6)}" y="${margin.top + 16}" fill="#c2410c" font-family="Arial, sans-serif" font-size="12" font-weight="700">Loaded</text>`,
        ].join('')
        : '';
    const stats = values.length
        ? `min ${formatStat(minSample)}   avg ${formatStat(avgSample)}   max ${formatStat(maxSample)}   last ${formatStat(lastSample)}`
        : 'No valid samples';

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>body { margin: 0; background: #ffffff; }</style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#ffffff" />
    <text x="${margin.left}" y="28" fill="#24292f" font-family="Arial, sans-serif" font-size="20" font-weight="700">FPS samples</text>
    <text x="${width - margin.right}" y="28" text-anchor="end" fill="#57606a" font-family="Arial, sans-serif" font-size="12">${stats}</text>
    ${grid}
    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#8c959f" />
    <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#8c959f" />
    ${xTicks}
    ${loadedMarker}
    ${points ? `<polyline fill="none" stroke="#0969da" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" />` : ''}
    ${circles}
    <text x="${(margin.left + width - margin.right) / 2}" y="${height - 8}" text-anchor="middle" fill="#57606a" font-family="Arial, sans-serif" font-size="12">Seconds</text>
  </svg>
</body>
</html>`;
}

async function saveFpsPlot(browser, samples, destination, options = {}) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const plotPage = await browser.newPage({ viewport: { width: 640, height: 320 } });
    try {
        await plotPage.setContent(buildFpsPlotSvg(samples, options), { waitUntil: 'load' });
        await plotPage.locator('svg').screenshot({
            path: destination,
            timeout: 60_000,
        });
    } finally {
        await plotPage.close();
    }
}

module.exports = {
    buildFpsPlotSvg,
    saveFpsPlot,
};
