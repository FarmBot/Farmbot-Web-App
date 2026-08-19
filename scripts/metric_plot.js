const fs = require('fs');
const path = require('path');

const escapeSvgText = value => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const formatStat = value => value.toFixed(2);
const formatWholeStat = value => Math.round(value).toString();
const formatPoint = value => Number(value.toFixed(2));
const roundedAxisMax = (value, baseline) =>
    Math.max(baseline, Math.ceil(value / (baseline / 2)) * (baseline / 2));
const prefixLabelWithValue = (label, value) => {
    const match = label.match(/^(.*) \(([^)]+)\)$/);
    if (!match) { return `${value} ${label}`; }
    return `${value}${match[2]} ${match[1].toLowerCase()}`;
};
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
            averaged: typeof sample === 'object' ? sample.averaged : undefined,
        };
    })
    .filter(({ value, x }) => Number.isFinite(value) && Number.isFinite(x));

const normalizeSeries = (series, valueKey) => series
    .map((item, index) => ({
        name: item.name || `Series ${index + 1}`,
        color: item.color || seriesColors[index % seriesColors.length],
        axis: item.axis || 'left',
        strokeWidth: item.strokeWidth,
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
    const yMinOverride = Number(options.yMin);
    const yMaxOverride = Number(options.yMax);
    const yMaxBaseline = Number(options.yMaxBaseline);
    const yTickInterval = Number(options.yTickInterval);
    const xTickInterval = Number(options.xTickInterval);
    const xGridInterval = Number(options.xGridInterval);
    const rightYMinOverride = Number(options.rightYMin);
    const rightYMaxBaseline = Number(options.rightYMaxBaseline);
    const rightYTickInterval = Number(options.rightYTickInterval);
    const decimalValues = options.decimalValues === true;
    const formatMetricValue = decimalValues ? formatStat : formatWholeStat;
    const series = normalizeSeries(options.series || [{
        name: options.seriesName || title,
        samples: inputSamples,
    }], valueKey);
    const multiSeries = series.length > 1;
    const rightAxisSeries = series.filter(item => item.axis === 'right');
    const leftAxisSeries = series.filter(item => item.axis !== 'right');
    const hasRightAxis = rightAxisSeries.length > 0;
    const rightAxisColor = rightAxisSeries[0]?.color || '#57606a';
    const rightAxisLabel = escapeSvgText(rightAxisSeries[0]?.name || '');
    if (!Number.isFinite(yTickInterval)) {
        throw new Error('yTickInterval is required');
    }
    if (options.xTickInterval !== undefined
        && (!Number.isFinite(xTickInterval) || xTickInterval <= 0)) {
        throw new Error('xTickInterval must be a positive number');
    }
    if (options.xGridInterval !== undefined
        && (!Number.isFinite(xGridInterval) || xGridInterval <= 0)) {
        throw new Error('xGridInterval must be a positive number');
    }
    if (hasRightAxis && ![
        rightYMinOverride,
        rightYMaxBaseline,
        rightYTickInterval,
    ].every(Number.isFinite)) {
        throw new Error('rightYMin, rightYMaxBaseline, and rightYTickInterval are required for right-axis series');
    }
    const margin = {
        top: multiSeries ? 76 : 52,
        right: hasRightAxis ? 68 : 24,
        bottom: multiSeries ? 52 : 44,
        left: 54,
    };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const finite = series.flatMap(item => item.samples);
    const leftValues = (leftAxisSeries.length ? leftAxisSeries : series)
        .flatMap(item => item.samples)
        .map(({ value }) => value);
    const rightValues = rightAxisSeries
        .flatMap(item => item.samples)
        .map(({ value }) => value);
    const values = leftValues;
    const labelableSamples = series.flatMap(item =>
        item.samples.map(sample => ({
            ...sample,
            axis: item.axis,
            color: item.color,
        })));
    const summarySamples = options.summaryStatsAfterLoaded
        ? labelableSamples.filter(({ loading }) => loading === false)
        : labelableSamples;
    const summaryValues = summarySamples.map(({ value }) => value);
    const xValues = finite
        .map(({ x }) => x)
        .filter(value => Number.isFinite(value));
    const maxSample = summaryValues.length ? Math.max(...summaryValues) : 0;
    const yMinSample = values.length ? Math.min(...values) : 0;
    const defaultMinValue = values.length ? yMinSample : 0;
    const minValue = Number.isFinite(yMinOverride) ? yMinOverride : defaultMinValue;
    const yMaxSample = values.length > 1
        ? [...values].sort((a, b) => b - a)[1]
        : maxSample;
    const defaultMaxValue = roundedAxisMax(yMaxSample, yMaxBaseline);
    const maxValue = Number.isFinite(yMaxOverride) ? yMaxOverride : defaultMaxValue;
    const valueRange = maxValue - minValue || 1;
    const rightDataMin = rightValues.length ? Math.min(...rightValues) : 0;
    const rightDataMax = rightValues.length ? Math.max(...rightValues) : 0;
    const rightMinValue = rightYMinOverride;
    const rightMaxValue = roundedAxisMax(rightDataMax, rightYMaxBaseline);
    const rightValueRange = rightMaxValue - rightMinValue || 1;
    const minX = Math.min(0, xValues.length ? Math.min(...xValues) : 0);
    const maxX = Math.max(1, xValues.length ? Math.max(...xValues) : inputSamples.length - 1);
    const xRange = maxX - minX || 1;
    const xFor = x => margin.left + (
        (x - minX) / xRange
    ) * plotWidth;
    const yFor = value => {
        const y = margin.top + ((maxValue - value) / valueRange) * plotHeight;
        return Math.max(margin.top, Math.min(height - margin.bottom, y));
    };
    const rightYFor = value => {
        const y = margin.top + ((rightMaxValue - value) / rightValueRange) * plotHeight;
        return Math.max(margin.top, Math.min(height - margin.bottom, y));
    };
    const lines = series
        .map(item => {
            const seriesYFor = item.axis === 'right' ? rightYFor : yFor;
            const points = item.samples
                .map(({ value, x }) =>
                    `${formatPoint(xFor(x))},${formatPoint(seriesYFor(value))}`)
                .join(' ');
            return points
                ? `<polyline fill="none" stroke="${item.color}" stroke-width="${item.strokeWidth || (multiSeries ? 2 : 3)}" stroke-linecap="round" stroke-linejoin="round" points="${points}" />`
                : '';
        })
        .join('');
    const circles = multiSeries
        ? ''
        : (series[0]?.samples || [])
            .map(({ value, x, index }) => {
                const highlighted = index === highlightIndex;
                const seriesYFor = series[0]?.axis === 'right' ? rightYFor : yFor;
                return [
                    `<circle cx="${formatPoint(xFor(x))}" cy="${formatPoint(seriesYFor(value))}"`,
                    ` r="${highlighted ? 5 : 3}" fill="${highlighted ? '#f97316' : series[0].color}" />`,
                ].join('');
            })
            .join('');
    const summaryPoints = options.labelSummaryPoints === false || !summarySamples.length
        ? []
        : [
            ['min', summarySamples.reduce((best, sample) =>
                sample.value < best.value ? sample : best, summarySamples[0])],
            ['max', summarySamples.reduce((best, sample) =>
                sample.value > best.value ? sample : best, summarySamples[0])],
            ['last', summarySamples[summarySamples.length - 1]],
        ];
    const groupedSummaryPoints = summaryPoints.reduce((groups, [label, sample]) => {
        const key = `${sample.index}:${sample.x}:${sample.value}`;
        const group = groups.get(key) || { labels: [], sample };
        group.labels.push(label);
        groups.set(key, group);
        return groups;
    }, new Map());
    const pointLabels = Array.from(groupedSummaryPoints.values())
        .map(({ labels, sample: { axis, color, value, x } }) => {
            const seriesYFor = axis === 'right' ? rightYFor : yFor;
            const pointX = xFor(x);
            const pointY = seriesYFor(value);
            const labelX = Math.max(margin.left + 4, Math.min(width - margin.right - 4, pointX));
            const labelY = labels.includes('min') && !labels.includes('max')
                ? Math.min(height - 20, pointY + 14)
                : Math.max(12, pointY - 8);
            const textAnchor = pointX > width - margin.right - 24
                ? 'end'
                : pointX < margin.left + 24 ? 'start' : 'middle';
            return `<text x="${formatPoint(labelX)}" y="${formatPoint(labelY)}" text-anchor="${textAnchor}" fill="${color}" font-family="Arial, sans-serif" font-size="10" font-weight="700">${labels.join('/')} ${formatMetricValue(value)}</text>`;
        })
        .join('');
    const gridValues = Array.from({ length: Math.floor((maxValue - minValue) / yTickInterval) + 1 },
        (_value, index) => maxValue - (index * yTickInterval));
    const grid = gridValues
        .map(value => {
            const y = formatPoint(yFor(value));
            return [
                `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#d0d7de" />`,
                `<text x="${margin.left - 10}" y="${formatPoint(y + 4)}" text-anchor="end" fill="#57606a" font-size="12">${formatMetricValue(value)}</text>`,
            ].join('');
        })
        .join('');
    const rightGridValues = hasRightAxis
        ? Array.from({ length: Math.floor((rightMaxValue - rightMinValue) / rightYTickInterval) + 1 },
            (_value, index) => rightMaxValue - (index * rightYTickInterval))
        : [];
    const rightAxisTicks = hasRightAxis
        ? rightGridValues
            .map(value => {
                const y = formatPoint(rightYFor(value));
                return [
                    `<line x1="${width - margin.right}" y1="${y}" x2="${width - margin.right + 5}" y2="${y}" stroke="${rightAxisColor}" stroke-width="2" />`,
                    `<text x="${width - margin.right + 10}" y="${formatPoint(y + 4)}" fill="${rightAxisColor}" font-size="12" font-weight="700">${formatMetricValue(value)}</text>`,
                ].join('');
            })
            .join('')
        : '';
    const tickInterval = Number.isFinite(xTickInterval)
        ? xTickInterval
        : maxX <= 10 ? 1 : maxX <= 100 ? 10 : 100;
    const xGrid = Number.isFinite(xGridInterval)
        ? Array.from({ length: Math.floor(maxX / xGridInterval) + 1 },
            (_value, index) => {
                const gridValue = index * xGridInterval;
                const x = formatPoint(xFor(gridValue));
                return `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#d0d7de" />`;
            })
            .join('')
        : '';
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
    const historyBoundaryIndex = Number(options.historyBoundaryIndex);
    const historyBoundarySample = Number.isInteger(historyBoundaryIndex)
        ? series[0]?.samples.find(({ index }) => index === historyBoundaryIndex)
        : undefined;
    const historyBoundaryMarker = historyBoundarySample
        ? (() => {
            const markerX = xFor(historyBoundarySample.x);
            const labelOnLeft = markerX > width - margin.right - 64;
            return [
                `<line x1="${formatPoint(markerX)}" y1="${margin.top}" x2="${formatPoint(markerX)}" y2="${height - margin.bottom}" stroke="#8250df" stroke-width="2" stroke-dasharray="2 4" stroke-linecap="round" />`,
                `<text x="${formatPoint(markerX + (labelOnLeft ? -6 : 6))}" y="${margin.top + 16}" text-anchor="${labelOnLeft ? 'end' : 'start'}" fill="#8250df" font-family="Arial, sans-serif" font-size="12" font-weight="700">staging</text>`,
            ].join('');
        })()
        : '';
    const firstLoaded = series[0]?.samples.find(({ loading }) => loading === false);
    const loadedLabel = firstLoaded
        ? escapeSvgText(`Loaded ${formatStat(firstLoaded.x)}s`)
        : '';
    const loadedMarker = firstLoaded
        ? [
            `<line x1="${formatPoint(xFor(firstLoaded.x))}" y1="${margin.top}" x2="${formatPoint(xFor(firstLoaded.x))}" y2="${height - margin.bottom}" stroke="#f97316" stroke-width="2" stroke-dasharray="5 4" />`,
            `<text x="${formatPoint(xFor(firstLoaded.x) + 6)}" y="${margin.top + 16}" fill="#c2410c" font-family="Arial, sans-serif" font-size="12" font-weight="700">${loadedLabel}</text>`,
        ].join('')
        : '';
    const averageValue = Number(options.averageValue);
    const averageLine = Number.isFinite(averageValue)
        ? [
            `<line x1="${formatPoint(firstLoaded ? xFor(firstLoaded.x) : margin.left)}" y1="${formatPoint(yFor(averageValue))}" x2="${width - margin.right}" y2="${formatPoint(yFor(averageValue))}" stroke="#1a7f37" stroke-width="2" stroke-dasharray="4 4" />`,
            `<text x="${width - margin.right - 6}" y="${formatPoint(yFor(0) - 6)}" text-anchor="end" fill="#1a7f37" font-family="Arial, sans-serif" font-size="12" font-weight="700">avg ${formatMetricValue(averageValue)}</text>`,
        ].join('')
        : '';
    const legend = multiSeries
        ? series
            .map((item, index) => {
                const x = margin.left + (index % 5) * 112;
                const y = 48 + Math.floor(index / 5) * 16;
                const lastValue = item.samples[item.samples.length - 1]?.value;
                const label = Number.isFinite(lastValue)
                    ? prefixLabelWithValue(item.name, formatMetricValue(lastValue))
                    : item.name;
                return [
                    `<line x1="${x}" y1="${y - 4}" x2="${x + 16}" y2="${y - 4}" stroke="${item.color}" stroke-width="${item.strokeWidth || 3}" />`,
                    `<text x="${x + 21}" y="${y}" fill="${item.axis === 'right' ? item.color : '#57606a'}" font-family="Arial, sans-serif" font-size="10" font-weight="${item.axis === 'right' ? 700 : 400}">${escapeSvgText(label)}</text>`,
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
    ${legend}
    ${grid}
    ${xGrid}
    <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#8c959f" />
    ${hasRightAxis ? `<line x1="${width - margin.right}" y1="${margin.top}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="${rightAxisColor}" stroke-width="2" />` : ''}
    ${rightAxisTicks}
    ${hasRightAxis ? `<text x="${width - 16}" y="${formatPoint((margin.top + height - margin.bottom) / 2)}" transform="rotate(90 ${width - 16} ${formatPoint((margin.top + height - margin.bottom) / 2)})" text-anchor="middle" fill="${rightAxisColor}" font-family="Arial, sans-serif" font-size="12" font-weight="700">${rightAxisLabel}</text>` : ''}
    <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#8c959f" />
    ${xTicks}
    ${historyBoundaryMarker}
    ${loadedMarker}
    ${averageLine}
    ${lines}
    ${circles}
    ${pointLabels}
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

const latestCommitShaFor = (rows, valueHeaders) => [...rows]
    .reverse()
    .find(row => row['commit sha'] && valueHeaders.some(header =>
        Number.isFinite(Number(row[header]))))?.['commit sha'];

const historyBoundaryIndexFor = rows => {
    for (let index = rows.length - 1; index >= 0; index--) {
        const source = rows[index].source?.trim();
        if (!source || source === 'staging') { return index; }
    }
    return undefined;
};

const addLatestCommitSha = (svg, latestCommitSha) => {
    if (!latestCommitSha) { return svg; }
    const label = escapeSvgText(latestCommitSha);
    return svg.replace(
        /(\s*<\/svg>)/,
        `\n    <text x="616" y="312" text-anchor="end" fill="#57606a" font-family="Arial, sans-serif" font-size="12">${label}</text>$1`,
    );
};

const title = (basename, prefix) => {
    const name = basename.replace(/\.csv$/, '').replace(/_/g, ' ');
    const suffix = name.replace(prefix.toLowerCase(), '').trim();
    return suffix ? `${prefix}: ${suffix}` : prefix;
}

const inferCsvPlot = ({ headers, rows }, filename = '') => {
    const basename = path.basename(filename);
    const isSceneMetricsCsv = /^scene_metrics(?:_[^/]+)?\.csv$/.test(basename);
    const isFpsHistoryCsv = basename === 'fps_history.csv';
    const firstHeader = headers[0];
    const xHeader = headers.find(header =>
        ['elapsed seconds', 'elapsedSeconds'].includes(header));
    const sceneMetricExcludedHeaders = [
        'epoch',
        'Points',
        'Lines',
        'commit sha',
        'source',
    ];
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
        averaged: row.averaged === undefined ? undefined : row.averaged === 'true',
    });
    const plottableHeaders = headers
        .filter(header => !sceneMetricExcludedHeaders.includes(header))
        .filter(header => rows.some(row => Number.isFinite(sceneMetricValueFor(row, header))));

    if (headers.includes('percent')) {
        return {
            title: 'Frontend coverage',
            xLabel: 'Runs',
            yMaxBaseline: 100,
            yTickInterval: 0.1,
            decimalValues: true,
            samples: rows.map((row, index) => sampleFor(row, index, 'percent')),
            historyBoundaryIndex: historyBoundaryIndexFor(rows),
            latestCommitSha: latestCommitShaFor(rows, ['percent']),
        };
    }
    if (isFpsHistoryCsv && headers.includes('fps')) {
        return {
            title: 'FPS history',
            xLabel: 'Runs',
            yMin: 0,
            yMaxBaseline: 200,
            yTickInterval: 100,
            decimalValues: false,
            samples: rows.map((row, index) => sampleFor(row, index, 'fps')),
            historyBoundaryIndex: historyBoundaryIndexFor(rows),
            latestCommitSha: latestCommitShaFor(rows, ['fps']),
        };
    }
    if (headers.includes('FPS')) {
        if (isSceneMetricsCsv) {
            return {
                title: title(basename, 'Scene metrics'),
                xLabel: 'Runs',
                yMin: 0,
                yMaxBaseline: 2000,
                yTickInterval: 1000,
                rightYMin: 0,
                rightYMaxBaseline: 40,
                rightYTickInterval: 10,
                labelSummaryPoints: false,
                series: plottableHeaders.map(header => ({
                    name: sceneMetricLabelFor(header),
                    ...(header === 'FPS' ? { axis: 'right', strokeWidth: 4 } : {}),
                    samples: rows.map((row, index) => ({
                        x: index,
                        value: sceneMetricValueFor(row, header),
                    })),
                })),
                historyBoundaryIndex: historyBoundaryIndexFor(rows),
                latestCommitSha: latestCommitShaFor(rows, plottableHeaders),
            };
        }
        return {
            title: title(basename, 'FPS samples'),
            xLabel: 'Runs',
            yMin: 0,
            yMaxBaseline: 200,
            yTickInterval: 100,
            samples: rows.map((row, index) => sampleFor(row, index, 'FPS')),
            latestCommitSha: latestCommitShaFor(rows, ['FPS']),
        };
    }
    if (headers.includes('fps')) {
        const averagedValues = rows
            .filter(row => row.averaged === 'true')
            .map(row => Number(row.fps))
            .filter(Number.isFinite);
        const averageValue = averagedValues.length
            ? averagedValues.reduce((total, value) => total + value, 0)
            / averagedValues.length
            : undefined;
        const highlightIndex = rows.findIndex(row => row.chosen === 'true');
        return {
            title: title(basename, 'FPS samples'),
            xLabel: xHeader ? 'Seconds' : 'Samples',
            xTickInterval: xHeader ? 1 : undefined,
            xGridInterval: xHeader ? 1 : undefined,
            yMin: 0,
            yMaxBaseline: 200,
            yTickInterval: 100,
            samples: rows.map((row, index) => sampleFor(row, index, 'fps')),
            summaryStatsAfterLoaded: true,
            ...(Number.isFinite(averageValue) ? { averageValue } : {}),
            ...(highlightIndex >= 0 ? { highlightIndex } : {}),
            latestCommitSha: latestCommitShaFor(rows, ['fps']),
        };
    }
    throw new Error(`No plottable metric found in ${basename || firstHeader || 'CSV'}`);
};

const buildCsvPlotSvg = (content, options = {}) => {
    const inferred = options.inferred || inferCsvPlot(parseCsv(content), options.filename);
    const { latestCommitSha, ...plotOptions } = inferred;
    const svgOptions = { ...options };
    delete svgOptions.inferred;
    const svg = buildMetricPlotSvg(inferred.samples, { ...plotOptions, ...svgOptions });
    return addLatestCommitSha(svg, latestCommitSha);
};

async function saveCsvPlot(browser, csvPath, destination, options = {}) {
    const content = fs.readFileSync(csvPath, 'utf8');
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const plotPage = await browser.newPage({ viewport: { width: 640, height: 320 } });
    try {
        await plotPage.setContent(buildCsvPlotSvg(content, {
            filename: csvPath,
            ...options,
        }), { waitUntil: 'load' });
        await plotPage.locator('svg').screenshot({
            path: destination,
            timeout: 60_000,
        });
    } finally {
        await plotPage.close();
    }
}

async function saveLoadDurationPlot(browser, csvPath, destination) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const { headers, rows } = parseCsv(content);
    if (
        !headers.includes('fps')
        || !headers.includes('% change')
        || !headers.includes('load duration')
        || !rows.some(row => Number.isFinite(Number(row['load duration'])))
    ) {
        return undefined;
    }

    await saveCsvPlot(browser, csvPath, destination, {
        inferred: {
            title: 'Load duration',
            xLabel: 'Runs',
            yMin: 0,
            yMaxBaseline: 10,
            yTickInterval: 1,
            decimalValues: true,
            samples: rows.map((row, index) => ({
                x: index,
                value: Number(row['load duration']),
            })),
            historyBoundaryIndex: historyBoundaryIndexFor(rows),
            latestCommitSha: latestCommitShaFor(rows, ['load duration']),
        },
    });
    return destination;
}

function printUsage() {
    console.log([
        'Usage: bun scripts/metric_plot.js <csv_path> [plot_path]',
        '',
        'Supported CSV inputs:',
        '  fps_samples.csv     Plots the fps column against elapsed seconds.',
        '  fps_history.csv     Plots historical fps values.',
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
        const loadDurationName = process.env.LOAD_DURATION_NAME || 'load_duration';
        const loadDurationDestination = path.join('/tmp', `${loadDurationName}.png`);
        const loadDurationPlot = await saveLoadDurationPlot(
            browser, csvPath, loadDurationDestination);
        if (loadDurationPlot) {
            console.log(`CSV_PLOT=${loadDurationPlot}`);
        }
    } finally {
        await browser.close();
    }
}

module.exports = {
    buildCsvPlotSvg,
    buildMetricPlotSvg,
    escapeSvgText,
    historyBoundaryIndexFor,
    inferCsvPlot,
    parseCsv,
    saveCsvPlot,
    saveLoadDurationPlot,
    saveMetricPlot,
};

if (require.main === module) {
    main().catch((err) => {
        console.error('Failed to plot CSV:', err.message || err);
        process.exitCode = 1;
    });
}
