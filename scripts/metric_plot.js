const fs = require('fs');
const path = require('path');

const escapeSvgText = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const formatStat = value => value.toFixed(2);
const formatPoint = value => Number(value.toFixed(2));
const seriesColors = [
    '#0969da',
    '#1a7f37',
    '#cf222e',
    '#8250df',
    '#bf8700',
    '#0a7ea4',
    '#d12470',
    '#57606a',
    '#953800',
    '#116329',
];
const normalizeMetricSamples = (samples, valueKey = 'value') => samples
    .map((sample, index) => {
        const value = typeof sample === 'object' ? sample[valueKey] : sample;
        const x = typeof sample === 'object'
            ? Number(sample.x ?? sample.elapsedSeconds ?? index)
            : index;
        return {
            value: Number(value),
            x,
            index,
            loading: typeof sample === 'object' ? sample.loading : undefined,
        };
    })
    .filter(({ value, x }) => Number.isFinite(value) && Number.isFinite(x));

const normalizeSeries = (series, valueKey) => series
    .map((item, index) => ({
        name: item.name || `Series ${index + 1}`,
        color: item.color || seriesColors[index % seriesColors.length],
        samples: normalizeMetricSamples(item.samples || [], valueKey),
    }))
    .filter(item => item.samples.length);

function buildMetricPlotSvg(samples, options = {}) {
    const inputSamples = samples || [];
    const width = options.width || 640;
    const height = options.height || 320;
    const highlightIndex = options.highlightIndex;
    const title = escapeSvgText(options.title || 'Metric samples');
    const xLabel = escapeSvgText(options.xLabel || 'Samples');
    const valueKey = options.valueKey || 'value';
    const series = normalizeSeries(options.series || [{
        name: options.seriesName || title,
        samples: inputSamples,
    }], valueKey);
    const multiSeries = series.length > 1;
    const margin = {
        top: multiSeries ? 76 : 52,
        right: 24,
        bottom: multiSeries ? 52 : 44,
        left: 54,
    };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const finite = series.flatMap(item => item.samples);
    const values = finite.map(({ value }) => value);
    const xValues = finite
        .map(({ x }) => x)
        .filter(value => Number.isFinite(value));
    const minSample = values.length ? Math.min(...values) : 0;
    const maxSample = values.length ? Math.max(...values) : 0;
    const avgSample = values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : 0;
    const lastSample = values.length ? values[values.length - 1] : 0;
    const minValue = values.length ? minSample : 0;
    const maxValue = Math.max(1, maxSample);
    const valueRange = maxValue - minValue || 1;
    const minX = Math.min(0, xValues.length ? Math.min(...xValues) : 0);
    const maxX = Math.max(1, xValues.length ? Math.max(...xValues) : inputSamples.length - 1);
    const xRange = maxX - minX || 1;
    const xFor = x => margin.left + (
        (x - minX) / xRange
    ) * plotWidth;
    const yFor = value => margin.top + ((maxValue - value) / valueRange) * plotHeight;
    const lines = series
        .map(item => {
            const points = item.samples
                .map(({ value, x }) =>
                    `${formatPoint(xFor(x))},${formatPoint(yFor(value))}`)
                .join(' ');
            return points
                ? `<polyline fill="none" stroke="${item.color}" stroke-width="${multiSeries ? 2 : 3}" stroke-linecap="round" stroke-linejoin="round" points="${points}" />`
                : '';
        })
        .join('');
    const circles = multiSeries
        ? ''
        : (series[0]?.samples || [])
            .map(({ value, x, index }) => {
                const highlighted = index === highlightIndex;
                return [
                    `<circle cx="${formatPoint(xFor(x))}" cy="${formatPoint(yFor(value))}"`,
                    ` r="${highlighted ? 5 : 3}" fill="${highlighted ? '#f97316' : series[0].color}" />`,
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
    const tickInterval = maxX <= 10 ? 1 : maxX <= 100 ? 10 : 100;
    const xTicks = Array.from({ length: Math.floor(maxX / tickInterval) + 1 },
        (_value, index) => {
            const tickValue = index * tickInterval;
            const x = formatPoint(xFor(tickValue));
            return [
                `<line x1="${x}" y1="${height - margin.bottom}" x2="${x}" y2="${height - margin.bottom + 5}" stroke="#8c959f" />`,
                `<text x="${x}" y="${height - 22}" text-anchor="middle" fill="#57606a" font-family="Arial, sans-serif" font-size="10">${tickValue}</text>`,
            ].join('');
        })
        .join('');
    const firstLoaded = series[0]?.samples.find(({ loading }) => loading === false);
    const loadedMarker = firstLoaded
        ? [
            `<line x1="${formatPoint(xFor(firstLoaded.x))}" y1="${margin.top}" x2="${formatPoint(xFor(firstLoaded.x))}" y2="${height - margin.bottom}" stroke="#f97316" stroke-width="2" stroke-dasharray="5 4" />`,
            `<text x="${formatPoint(xFor(firstLoaded.x) + 6)}" y="${margin.top + 16}" fill="#c2410c" font-family="Arial, sans-serif" font-size="12" font-weight="700">Loaded</text>`,
        ].join('')
        : '';
    const stats = escapeSvgText(values.length
        ? `min ${formatStat(minSample)}   avg ${formatStat(avgSample)}   max ${formatStat(maxSample)}   last ${formatStat(lastSample)}`
        : 'No valid samples');
    const legend = multiSeries
        ? series
            .map((item, index) => {
                const x = margin.left + (index % 5) * 112;
                const y = 48 + Math.floor(index / 5) * 16;
                return [
                    `<line x1="${x}" y1="${y - 4}" x2="${x + 16}" y2="${y - 4}" stroke="${item.color}" stroke-width="3" />`,
                    `<text x="${x + 21}" y="${y}" fill="#57606a" font-family="Arial, sans-serif" font-size="10">${escapeSvgText(item.name)}</text>`,
                ].join('');
            })
            .join('')
        : '';

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>body { margin: 0; background: #ffffff; }</style>
</head>
<body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#ffffff" />
    <text x="${margin.left}" y="28" fill="#24292f" font-family="Arial, sans-serif" font-size="20" font-weight="700">${title}</text>
    <text x="${width - margin.right}" y="28" text-anchor="end" fill="#57606a" font-family="Arial, sans-serif" font-size="12">${stats}</text>
    ${legend}
    ${grid}
    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#8c959f" />
    <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#8c959f" />
    ${xTicks}
    ${loadedMarker}
    ${lines}
    ${circles}
    <text x="${(margin.left + width - margin.right) / 2}" y="${height - 8}" text-anchor="middle" fill="#57606a" font-family="Arial, sans-serif" font-size="12">${xLabel}</text>
  </svg>
</body>
</html>`;
}

async function saveMetricPlot(browser, samples, destination, options = {}) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const plotPage = await browser.newPage({ viewport: { width: 640, height: 320 } });
    try {
        await plotPage.setContent(buildMetricPlotSvg(samples, options), { waitUntil: 'load' });
        await plotPage.locator('svg').screenshot({
            path: destination,
            timeout: 60_000,
        });
    } finally {
        await plotPage.close();
    }
}

const parseCsvLine = line => {
    const fields = [];
    let field = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && quoted && line[i + 1] === '"') {
            field += '"';
            i++;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === ',' && !quoted) {
            fields.push(field.trim());
            field = '';
        } else {
            field += char;
        }
    }
    fields.push(field.trim());
    return fields;
};

const parseCsv = content => {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    const headers = lines.length ? parseCsvLine(lines[0]) : [];
    const rows = lines.slice(1).map(line => {
        const fields = parseCsvLine(line);
        return Object.fromEntries(headers.map((header, index) => [header, fields[index]]));
    });
    return { headers, rows };
};

const inferCsvPlot = ({ headers, rows }, filename = '') => {
    const basename = path.basename(filename);
    const firstHeader = headers[0];
    const xHeader = headers.find(header =>
        ['elapsed seconds', 'elapsedSeconds'].includes(header));
    const sceneMetricExcludedHeaders = ['epoch', 'Points', 'Lines'];
    const sceneMetricValueFor = (row, header) => {
        const value = Number(row[header]);
        if (header === 'FPS') { return value ? 1000 / value : NaN; }
        return header === 'Triangles' ? value / 1000 : value;
    };
    const valueFor = (row, header) => Number(row[header]);
    const sceneMetricLabelFor = header => {
        if (header === 'FPS') { return 'Frame time (ms)'; }
        return header === 'Triangles' ? 'Triangles (k)' : header;
    };
    const sampleFor = (row, index, valueHeader) => ({
        x: xHeader ? row[xHeader] : index,
        value: valueFor(row, valueHeader),
        loading: row.loading === undefined ? undefined : row.loading === 'true',
    });
    const plottableHeaders = headers
        .filter(header => !sceneMetricExcludedHeaders.includes(header))
        .filter(header => rows.some(row => Number.isFinite(sceneMetricValueFor(row, header))));

    if (headers.includes('percent')) {
        return {
            title: 'Frontend coverage',
            xLabel: 'Runs',
            samples: rows.map((row, index) => sampleFor(row, index, 'percent')),
        };
    }
    if (headers.includes('FPS')) {
        if (basename === 'scene_metrics.csv') {
            return {
                title: 'Scene metrics',
                xLabel: 'Runs',
                series: plottableHeaders.map(header => ({
                    name: sceneMetricLabelFor(header),
                    samples: rows.map((row, index) => ({
                        x: index,
                        value: sceneMetricValueFor(row, header),
                    })),
                })),
            };
        }
        return {
            title: 'FPS samples',
            xLabel: 'Runs',
            samples: rows.map((row, index) => sampleFor(row, index, 'FPS')),
        };
    }
    if (headers.includes('fps')) {
        const highlightIndex = rows.findIndex(row => row.chosen === 'true');
        return {
            title: 'FPS samples',
            xLabel: xHeader ? 'Seconds' : 'Samples',
            samples: rows.map((row, index) => sampleFor(row, index, 'fps')),
            ...(highlightIndex >= 0 ? { highlightIndex } : {}),
        };
    }
    throw new Error(`No plottable metric found in ${basename || firstHeader || 'CSV'}`);
};

const buildCsvPlotSvg = (content, options = {}) => {
    const inferred = inferCsvPlot(parseCsv(content), options.filename);
    return buildMetricPlotSvg(inferred.samples, { ...inferred, ...options });
};

async function saveCsvPlot(browser, csvPath, destination, options = {}) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const inferred = inferCsvPlot(parseCsv(content), csvPath);
    return saveMetricPlot(browser, inferred.samples, destination, {
        ...inferred,
        ...options,
    });
}

function printUsage() {
    console.log([
        'Usage: bun scripts/metric_plot.js <csv_path> [plot_path]',
        '',
        'Supported CSV inputs:',
        '  fps_samples.csv     Plots the fps column against elapsed seconds.',
        '  fe_coverage.csv     Plots the percent column.',
        '  scene_metrics.csv   Plots numeric columns.',
        '',
        'Arguments:',
        '  csv_path   CSV file to plot.',
        '  plot_path  Optional PNG output path. Default: /tmp/<csv basename>.png',
    ].join('\n'));
}

async function main() {
    const csvPath = process.argv[2];
    if (!csvPath || csvPath === '-h' || csvPath === '--help') {
        printUsage();
        process.exitCode = csvPath ? 0 : 1;
        return;
    }

    const destination = process.argv[3]
        || path.join('/tmp', `${path.basename(csvPath, '.csv')}.png`);
    const { chromium } = require('playwright');
    const browser = await chromium.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    try {
        await saveCsvPlot(browser, csvPath, destination);
        console.log(`CSV_PLOT=${destination}`);
    } finally {
        await browser.close();
    }
}

module.exports = {
    buildCsvPlotSvg,
    buildMetricPlotSvg,
    escapeSvgText,
    inferCsvPlot,
    parseCsv,
    saveCsvPlot,
    saveMetricPlot,
};

if (require.main === module) {
    main().catch((err) => {
        console.error('Failed to plot CSV:', err.message || err);
        process.exitCode = 1;
    });
}
