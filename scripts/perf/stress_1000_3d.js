const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const {
  PANEL_CAUSE_PREFIXES,
  countDeltas,
  median,
  panelRenderMetrics,
  renderCountDeltas,
  renderCounts,
  sourceProvenance,
  summary,
} = require("./stress_1000_3d_metrics");

const DEFAULT_URL = "http://localhost:3000";
const PRODUCT_LINE = "genesis_xl_1.8_stress_1000";
const MOVEMENT_PRODUCT_LINE = "genesis_xl_1.8";
const DEMO_USER = "farmbot_demo";
const TIMEOUT = 180_000;
const DEFAULT_VIEWPORT = { width: 3840, height: 2160 };
const MOVEMENT_VIEWPORT = { width: 1920, height: 1080 };
const DEFAULT_SAMPLE_MS = 12_000;

const MOVEMENT_COUNT_METRICS = {
  routingRenders: "render.BotRouting",
  effectsRenders: "render.BotEffects",
  getZCalls: "bot.getZ",
  xBeltBuilds: "bot.geometry.belt.x",
  xBeltUpdates: "bot.geometry.belt.x.update",
  xBeltDisposals: "bot.geometry.belt.x.dispose",
  yBeltBuilds: "bot.geometry.belt.y",
  yBeltUpdates: "bot.geometry.belt.y.update",
  yBeltDisposals: "bot.geometry.belt.y.dispose",
  zBeltBuilds: "bot.geometry.belt.z",
  zBeltUpdates: "bot.geometry.belt.z.update",
  zBeltDisposals: "bot.geometry.belt.z.dispose",
  xCarrierBuilds: "bot.geometry.carrier.x",
  xCarrierUpdates: "bot.geometry.carrier.x.update",
  xCarrierDisposals: "bot.geometry.carrier.x.dispose",
  yCarrierBuilds: "bot.geometry.carrier.y",
  yCarrierUpdates: "bot.geometry.carrier.y.update",
  yCarrierDisposals: "bot.geometry.carrier.y.dispose",
  zCarrierBuilds: "bot.geometry.carrier.z",
  zCarrierUpdates: "bot.geometry.carrier.z.update",
  zCarrierDisposals: "bot.geometry.carrier.z.dispose",
  airTubeBuilds: "bot.geometry.tube.air",
  solenoidTubeBuilds: "bot.geometry.tube.solenoid",
  solenoidStreamBuilds: "bot.geometry.tube.solenoidStream",
  waterSprayBuilds: "bot.geometry.waterSpray",
  cameraViewBuilds: "bot.geometry.cameraView",
  cameraViewEdgeBuilds: "bot.geometry.cameraViewEdges",
};

const MOVEMENT_SCENARIOS = [
  {
    name: "idle",
    start: { x: 500, y: 500, z: -100 },
    idleMs: 4_000,
  },
  {
    name: "x",
    start: { x: 500, y: 500, z: -100 },
    target: { x: 4_500, y: 500, z: -100 },
  },
  {
    name: "y",
    start: { x: 500, y: 300, z: -100 },
    target: { x: 500, y: 2_300, z: -100 },
  },
  {
    name: "z",
    start: { x: 500, y: 500, z: -50 },
    target: { x: 500, y: 500, z: -450 },
  },
  {
    name: "xyz",
    start: { x: 500, y: 300, z: -50 },
    target: { x: 4_500, y: 2_300, z: -450 },
  },
];

const WATER_MOVEMENT_SCENARIO = {
  name: "xyzWater",
  start: { x: 500, y: 300, z: -50 },
  target: { x: 4_500, y: 2_300, z: -450 },
};

const parseArgs = () => {
  const [command = "run", ...rest] = process.argv.slice(2);
  const args = { command };
  for (let i = 0; i < rest.length; i += 2) {
    args[rest[i].replace(/^--/, "")] = rest[i + 1];
  }
  return args;
};

const percentile = (values, p) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length == 0) { return undefined; }
  return sorted[Math.ceil((p / 100) * sorted.length) - 1];
};

const movementSummary = runs => {
  const result = {};
  for (const scenario of [
    ...MOVEMENT_SCENARIOS.map(({ name }) => name),
    WATER_MOVEMENT_SCENARIO.name,
  ]) {
    const scenarioRuns = runs.map(run => run.scenarios[scenario]);
    const metric = key => median(scenarioRuns.map(run => run[key]));
    result[scenario] = {
      fps: metric("fps"),
      frameP50Ms: metric("frameP50Ms"),
      frameP95Ms: metric("frameP95Ms"),
      enabledBotRenders: metric("enabledBotRenders"),
      gardenModelRenders: metric("gardenModelRenders"),
      reduxPublishes: metric("reduxPublishes"),
      routingSnapshots: metric("routingSnapshots"),
      ...Object.fromEntries(Object.keys(MOVEMENT_COUNT_METRICS)
        .map(key => [key, metric(key)])),
    };
  }
  return result;
};

const firstMark = (marks, ...names) => {
  for (const name of names) {
    const value = marks[name]?.[0];
    if (Number.isFinite(value)) { return value; }
  }
};

const maxMark = (marks, names) => {
  const values = names
    .map(name => marks[name]?.[0])
    .filter(Number.isFinite);
  return values.length > 0 ? Math.max(...values) : undefined;
};

const nextPaint = page =>
  page.evaluate(() => new Promise(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))));

const resourceSummary = async page => page.evaluate(() => {
  const jsResources = performance.getEntriesByType("resource")
    .filter(entry => entry.name.match(/\.js(\?|$)/));
  const modelResources = performance.getEntriesByType("resource")
    .filter(entry => entry.name.match(/\.(glb|gltf)(\?|$)/));
  const sum = key => jsResources
    .reduce((total, entry) => total + (entry[key] || 0), 0);
  const modelSum = key => modelResources
    .reduce((total, entry) => total + (entry[key] || 0), 0);
  const largestModels = modelResources
    .map(entry => ({
      name: entry.name.split("/").pop(),
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      duration: entry.duration || 0,
    }))
    .sort((a, b) => b.encodedBodySize - a.encodedBodySize)
    .slice(0, 10);
  const largestJs = jsResources
    .map(entry => ({
      name: entry.name.split("/").pop(),
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      duration: entry.duration || 0,
    }))
    .sort((a, b) => b.encodedBodySize - a.encodedBodySize)
    .slice(0, 10);
  return {
    jsResourceCount: jsResources.length,
    jsTransferBytes: sum("transferSize"),
    jsEncodedBytes: sum("encodedBodySize"),
    jsDecodedBytes: sum("decodedBodySize"),
    largestJs,
    modelResourceCount: modelResources.length,
    modelTransferBytes: modelSum("transferSize"),
    modelEncodedBytes: modelSum("encodedBodySize"),
    modelDecodedBytes: modelSum("decodedBodySize"),
    largestModels,
  };
});

const runtimeSummary = async page => page.evaluate(() => {
  const parseLegacySceneMetrics = () => {
    const values = (window.__scene_metrics || "")
      .split(",")
      .map(value => Number(value.trim()));
    return {
      calls: values[2],
      triangles: values[3],
      geometries: values[6],
      textures: values[7],
      total: values[8],
      meshes: values[9],
      instancedMeshes: values[10],
    };
  };
  const legacy = parseLegacySceneMetrics();
  const render = window.__threeDRenderMetrics || {};
  const scene = window.__collectThreeDSceneMetrics?.() || {};
  const memory = performance.memory || {};
  return {
    drawCalls: render.calls ?? legacy.calls,
    triangles: render.triangles ?? legacy.triangles,
    webglGeometries: render.geometries ?? legacy.geometries,
    webglTextures: render.textures ?? legacy.textures,
    sceneObjects: scene.total ?? legacy.total,
    sceneMeshes: scene.meshes ?? legacy.meshes,
    sceneInstancedMeshes: scene.instancedMeshes ?? legacy.instancedMeshes,
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
  };
});

const performanceMetrics = async session => {
  const { metrics } = await session.send("Performance.getMetrics");
  return Object.fromEntries(metrics.map(metric => [metric.name, metric.value]));
};

const processInfo = async session => {
  const { processInfo: processes } =
    await session.send("SystemInfo.getProcessInfo");
  return processes;
};

const processCpuSnapshot = async session =>
  Object.fromEntries((await processInfo(session)).map(process => [
    process.id,
    { type: process.type, cpuTime: process.cpuTime },
  ]));

const processCpuDelta = (before, after) => {
  const byType = {};
  for (const [id, process] of Object.entries(after)) {
    const previous = before[id];
    if (!previous || previous.type != process.type) { continue; }
    const deltaMs = Math.max(0, process.cpuTime - previous.cpuTime) * 1_000;
    byType[process.type] = (byType[process.type] || 0) + deltaMs;
  }
  return {
    byType,
    totalMs: Object.values(byType).reduce((sum, value) => sum + value, 0),
    rendererMs: Object.entries(byType)
      .filter(([type]) => type.toLowerCase().includes("renderer"))
      .reduce((sum, [, value]) => sum + value, 0),
    gpuMs: Object.entries(byType)
      .filter(([type]) => type.toLowerCase().includes("gpu"))
      .reduce((sum, [, value]) => sum + value, 0),
  };
};

const processRssSnapshot = async session => {
  const processes = await processInfo(session);
  const ids = processes.map(process => String(process.id));
  if (ids.length == 0) { return {}; }
  let output;
  try {
    output = execFileSync(
      "ps",
      ["-o", "pid=,rss=", "-p", ids.join(",")],
      { encoding: "utf8" },
    );
  } catch {
    return {};
  }
  const rssById = Object.fromEntries(output.trim().split("\n")
    .map(line => line.trim().split(/\s+/).map(Number))
    .filter(([id, rssKb]) => Number.isFinite(id) && Number.isFinite(rssKb))
    .map(([id, rssKb]) => [id, rssKb * 1_024]));
  const byType = {};
  for (const process of processes) {
    const rssBytes = rssById[process.id];
    if (!Number.isFinite(rssBytes)) { continue; }
    byType[process.type] = (byType[process.type] || 0) + rssBytes;
  }
  return byType;
};

const maxByProcessType = samples => {
  const result = {};
  for (const sample of samples) {
    for (const [type, value] of Object.entries(sample)) {
      result[type] = Math.max(result[type] || 0, value);
    }
  }
  return result;
};

const rendererGpuRss = byType => Object.entries(byType)
  .filter(([type]) => {
    const lower = type.toLowerCase();
    return lower.includes("renderer") || lower.includes("gpu");
  })
  .reduce((sum, [, value]) => sum + value, 0);

const startFrameMeasurement = page => page.evaluate(() => {
  window.__cpuGpuBenchmarkFrames = { active: true, timestamps: [] };
  const collect = timestamp => {
    const measurement = window.__cpuGpuBenchmarkFrames;
    if (!measurement?.active) { return; }
    measurement.timestamps.push(timestamp);
    requestAnimationFrame(collect);
  };
  requestAnimationFrame(collect);
});

const stopFrameMeasurement = page => page.evaluate(() => {
  const measurement = window.__cpuGpuBenchmarkFrames;
  if (!measurement) { return {}; }
  measurement.active = false;
  const timestamps = measurement.timestamps;
  const frameTimes = timestamps.slice(1)
    .map((timestamp, index) => timestamp - timestamps[index]);
  const sortedFrameTimes = [...frameTimes].sort((a, b) => a - b);
  const p95Index = Math.ceil(sortedFrameTimes.length * 0.95) - 1;
  const elapsedMs = timestamps.length > 1
    ? timestamps.at(-1) - timestamps[0]
    : 0;
  let left = 0;
  let maxFramesPerSecond = 0;
  timestamps.forEach((timestamp, right) => {
    while (timestamp - timestamps[left] > 1_000) { left++; }
    maxFramesPerSecond = Math.max(maxFramesPerSecond, right - left + 1);
  });
  return {
    elapsedMs,
    fpsAverage: elapsedMs > 0
      ? (timestamps.length - 1) * 1_000 / elapsedMs
      : undefined,
    fpsMax: maxFramesPerSecond,
    frameP95Ms: sortedFrameTimes[p95Index],
    frameCount: timestamps.length,
  };
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const measureCpuFramesAndMemory = async (browser, page, runWork) => {
  const browserSession = await browser.newBrowserCDPSession();
  const pageSession = await page.context().newCDPSession(page);
  await pageSession.send("Performance.enable");
  const cpuBefore = await processCpuSnapshot(browserSession);
  const metricsBefore = await performanceMetrics(pageSession);
  const rssSamples = [];
  let sampleMemory = true;
  const memorySampler = (async () => {
    while (sampleMemory) {
      rssSamples.push(await processRssSnapshot(browserSession));
      await delay(100);
    }
  })();
  await startFrameMeasurement(page);
  const wallStartedAt = performance.now();
  try {
    await runWork();
  } finally {
    sampleMemory = false;
    await memorySampler;
  }
  const wallElapsedMs = performance.now() - wallStartedAt;
  const frames = await stopFrameMeasurement(page);
  const metricsAfter = await performanceMetrics(pageSession);
  const cpuAfter = await processCpuSnapshot(browserSession);
  const cpu = processCpuDelta(cpuBefore, cpuAfter);
  const peakRssByType = maxByProcessType(rssSamples);
  await pageSession.detach();
  await browserSession.detach();
  return {
    ...frames,
    wallElapsedMs,
    cpuTotalMs: cpu.totalMs,
    cpuPercent: 100 * cpu.totalMs / wallElapsedMs,
    rendererCpuMs: cpu.rendererMs,
    gpuProcessCpuMs: cpu.gpuMs,
    mainThreadTaskMs: Math.max(
      0,
      (metricsAfter.TaskDuration - metricsBefore.TaskDuration) * 1_000,
    ),
    cpuByType: cpu.byType,
    peakRssByType,
    peakRendererGpuRssBytes: Math.max(
      0,
      ...rssSamples.map(rendererGpuRss),
    ),
  };
};

const webglInfo = page => page.evaluate(() => {
  const canvas = document.querySelector(".garden-bed-3d-model canvas");
  const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
  if (!gl) { return { status: "unavailable" }; }
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    status: "available",
    vendor: info
      ? gl.getParameter(info.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR),
    renderer: info
      ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER),
  };
});

const setupPanelClickMeasurement = page => page.evaluate(() => {
  window.__panelClickBenchmark = { clicks: [], events: [] };
  const target = document.querySelector("#plants");
  if (!target) { return; }
  const benchmarkButton = document.createElement("button");
  benchmarkButton.id = "fb-panel-benchmark-toggle";
  benchmarkButton.style.cssText = [
    "position:fixed",
    "inset:0 auto auto 0",
    "width:20px",
    "height:20px",
    "z-index:2147483647",
  ].join(";");
  benchmarkButton.addEventListener("click", () => target.click());
  document.body.appendChild(benchmarkButton);
  document.addEventListener("click", event => {
    const clickTarget = event.target;
    if (!(clickTarget instanceof Element)
      || !clickTarget.closest("#fb-panel-benchmark-toggle")) {
      return;
    }
    const startedAt = performance.now();
    const sample = { startedAt };
    window.__panelClickBenchmark?.clicks.push(sample);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sample.nextPaintMs = performance.now() - startedAt;
    }));
  }, true);
  if (!PerformanceObserver.supportedEntryTypes.includes("event")) { return; }
  const observer = new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (entry.name != "click") { continue; }
      window.__panelClickBenchmark?.events.push({
        startTime: entry.startTime,
        duration: entry.duration,
        processingStart: entry.processingStart,
        processingEnd: entry.processingEnd,
        interactionId: entry.interactionId,
      });
    }
  });
  observer.observe({
    type: "event",
    buffered: true,
    durationThreshold: 16,
  });
});

const measureTrustedPanelClick = async (page, plantsTab) => {
  const before = await page.evaluate(() => ({
    clicks: window.__panelClickBenchmark?.clicks.length || 0,
    marks:
      window.__fbPerf?.marks?.panel_camera_first_frame?.length || 0,
  }));
  await plantsTab.click();
  try {
    await page.waitForFunction(value => {
      const click = window.__panelClickBenchmark?.clicks[value.clicks];
      const markCount =
        window.__fbPerf?.marks?.panel_camera_first_frame?.length || 0;
      return Number.isFinite(click?.nextPaintMs) && markCount > value.marks;
    }, before, { timeout: 10_000 });
  } catch (error) {
    const diagnostics = await page.evaluate(value => ({
      click: window.__panelClickBenchmark?.clicks[value.clicks],
      marks: window.__fbPerf?.marks?.panel_camera_first_frame,
      path: window.location.pathname,
    }), before);
    throw new Error(
      `Panel click produced no camera frame: ${JSON.stringify(diagnostics)}`,
      { cause: error },
    );
  }
  await page.waitForTimeout(50);
  return page.evaluate(value => {
    const benchmark = window.__panelClickBenchmark;
    const click = benchmark?.clicks[value.clicks];
    const store = window.__fbPerf;
    const cameraMark =
      store?.marks?.panel_camera_first_frame?.[value.marks];
    const event = benchmark?.events
      .filter(entry => Math.abs(entry.startTime - click.startedAt) < 100)
      .at(-1);
    return {
      cameraResponseMs: Number.isFinite(cameraMark)
        ? store.startedAt + cameraMark - click.startedAt
        : undefined,
      nextPaintMs: click.nextPaintMs,
      eventDurationMs: event?.duration,
      inputDelayMs: event
        ? event.processingStart - event.startTime
        : undefined,
      processingMs: event
        ? event.processingEnd - event.processingStart
        : undefined,
    };
  }, before);
};

const panelClickSummary = samples => {
  const values = key => samples.map(sample => sample[key]);
  return {
    clickSamples: samples,
    clickToCameraMedianMs: median(values("cameraResponseMs")),
    clickToCameraP95Ms: percentile(values("cameraResponseMs"), 95),
    clickToNextPaintMedianMs: median(values("nextPaintMs")),
    clickToNextPaintP95Ms: percentile(values("nextPaintMs"), 95),
    eventDurationMedianMs: median(values("eventDurationMs")),
    eventDurationP95Ms: percentile(values("eventDurationMs"), 95),
    inputDelayP95Ms: percentile(values("inputDelayMs"), 95),
    processingP95Ms: percentile(values("processingMs"), 95),
  };
};

const perfCountSnapshot = page => page.evaluate(() =>
  ({ ...(window.__fbPerf?.counts || {}) }));

const measurePanelTransitions = async (
  browser,
  page,
  panelCycles,
) => {
  await setupPanelClickMeasurement(page);
  const plantsTab = page.locator("#fb-panel-benchmark-toggle");
  if (await plantsTab.count() == 0) { return {}; }
  const before = await page.evaluate(() => ({
    counts: { ...(window.__fbPerf?.counts || {}) },
    cameraMarks:
      window.__fbPerf?.marks?.panel_camera_first_frame?.length || 0,
  }));
  const clickSamples = [];
  const performance = await measureCpuFramesAndMemory(
    browser,
    page,
    async () => {
      for (let cycle = 0; cycle < panelCycles; cycle++) {
        let clickBefore = await perfCountSnapshot(page);
        let sample = await measureTrustedPanelClick(page, plantsTab);
        await page.waitForTimeout(350);
        let clickAfter = await perfCountSnapshot(page);
        sample.renderDeltas = renderCountDeltas(clickBefore, clickAfter);
        sample.causeDeltas = countDeltas(
          clickBefore,
          clickAfter,
          PANEL_CAUSE_PREFIXES,
        );
        clickSamples.push(sample);
        clickBefore = clickAfter;
        sample = await measureTrustedPanelClick(page, plantsTab);
        await page.waitForTimeout(350);
        clickAfter = await perfCountSnapshot(page);
        sample.renderDeltas = renderCountDeltas(clickBefore, clickAfter);
        sample.causeDeltas = countDeltas(
          clickBefore,
          clickAfter,
          PANEL_CAUSE_PREFIXES,
        );
        clickSamples.push(sample);
      }
    },
  );
  const after = await page.evaluate(() => ({
    counts: { ...(window.__fbPerf?.counts || {}) },
    cameraMarks:
      window.__fbPerf?.marks?.panel_camera_first_frame?.length || 0,
  }));
  return {
    ...performance,
    ...panelClickSummary(clickSamples),
    renderDeltas: renderCountDeltas(before.counts, after.counts),
    causeDeltas: countDeltas(
      before.counts,
      after.counts,
      PANEL_CAUSE_PREFIXES,
    ),
    cameraFirstFrameMarks: after.cameraMarks - before.cameraMarks,
  };
};

const createDemoSession = async (
  browser,
  baseUrl,
  productLine = PRODUCT_LINE,
) => {
  const secret = crypto.randomUUID().replaceAll("-", "");
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/demo`, { waitUntil: "domcontentloaded" });
  await page.addScriptTag({ path: require.resolve("mqtt/dist/mqtt.min.js") });
  const session = await page.evaluate(async ({ demoUser, line, value }) => {
    const configResponse = await fetch("/api/global_config");
    const config = await configResponse.json();
    const topic = `demos/${value}`;
    const client = window.mqtt.connect(config.MQTT_WS, {
      username: demoUser,
      password: "required, but not used.",
    });
    const tokenPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        client.end(true);
        reject(new Error("Timed out waiting for demo token over MQTT."));
      }, 180_000);
      client.on("connect", () => {
        client.subscribe(topic, error => error && reject(error));
      });
      client.on("message", (_topic, buffer) => {
        clearTimeout(timeout);
        client.end(true);
        resolve(buffer.toString());
      });
      client.on("error", reject);
    });
    const response = await fetch("/api/demo_account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: value, product_line: line }),
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return tokenPromise;
  }, {
    demoUser: DEMO_USER,
    line: productLine,
    value: secret,
  });
  await page.close();
  return session;
};

const authHeader = session => JSON.parse(session).token.encoded;

const apiJson = async (baseUrl, session, endpoint, options = {}) => {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: authHeader(session),
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${endpoint}`);
  }
  return response.json();
};

const setFarmwareEnv = async (baseUrl, session, key, value) => {
  const envs = await apiJson(baseUrl, session, "/api/farmware_envs");
  const existing = envs.find(env => env.key == key);
  if (existing) {
    await apiJson(baseUrl, session, `/api/farmware_envs/${existing.id}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  } else {
    await apiJson(baseUrl, session, "/api/farmware_envs", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
  }
};

const waitFor3D = async page => {
  await page.waitForFunction(() => {
    const canvas = document.querySelector(".garden-bed-3d-model canvas");
    return Boolean(canvas && typeof canvas.dataset.engine == "string");
  }, { timeout: TIMEOUT });
  await page.waitForFunction(() => typeof window.__fps == "number", {
    timeout: TIMEOUT,
  });
  await page.waitForFunction(() =>
    (window.__fbPerf?.marks?.three_d_full_ready?.length || 0) > 0, {
    timeout: TIMEOUT,
  });
  await page.waitForFunction(() =>
    (window.__fbPerf?.marks?.garden_camera_settled?.length || 0) > 0, {
    timeout: TIMEOUT,
  });
  await page.evaluate(async () => {
    const snapshot = () => JSON.stringify(
      Object.entries(window.__fbPerf?.counts || {})
        .filter(([key]) => key.startsWith("render.")
          || key == "gardenCamera.springFrame"),
    );
    const quietMs = 500;
    const timeoutMs = 30_000;
    const startedAt = performance.now();
    let quietStartedAt = startedAt;
    let previous = snapshot();
    while (performance.now() - startedAt < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 50));
      const current = snapshot();
      if (current != previous) {
        previous = current;
        quietStartedAt = performance.now();
      }
      if (performance.now() - quietStartedAt >= quietMs) { return; }
    }
    throw new Error("3D render counters did not reach quiescence.");
  });
};

const waitForBotBenchmark = async page => {
  await page.waitForFunction(() => !!window.__threeDBotBenchmark, {
    timeout: TIMEOUT,
  });
};

const summarizeFrameMeasurement = measurement => {
  const frameTimes = measurement.frameTimes.filter(Number.isFinite);
  const frameTime = frameTimes.reduce((total, value) => total + value, 0);
  const countDelta = key =>
    (measurement.afterCounts[key] || 0) -
    (measurement.beforeCounts[key] || 0);
  const movementCounts = Object.fromEntries(
    Object.entries(MOVEMENT_COUNT_METRICS)
      .map(([name, key]) => [name, countDelta(key)]),
  );
  return {
    fps: frameTime > 0 ? frameTimes.length * 1000 / frameTime : undefined,
    frameP50Ms: percentile(frameTimes, 50),
    frameP95Ms: percentile(frameTimes, 95),
    enabledBotRenders: countDelta("render.EnabledBot"),
    gardenModelRenders: countDelta("render.GardenModel"),
    reduxPublishes: countDelta("bot.demoPositionPublish"),
    routingSnapshots: countDelta("bot.routingSnapshot"),
    ...movementCounts,
    elapsedMs: measurement.elapsedMs,
    finalPosition: measurement.finalPosition,
  };
};

const verifyFinalPosition = (scenario, position) => {
  const expected = scenario.target || scenario.start;
  const exact = position && ["x", "y", "z"].every(axis =>
    Math.abs(position[axis] - expected[axis]) < 0.01);
  if (!exact) {
    throw new Error(
      `${scenario.name} ended at ${JSON.stringify(position)}, ` +
      `expected ${JSON.stringify(expected)}`,
    );
  }
};

const repositionBot = async (page, position) => {
  await page.evaluate(async target => {
    await window.__threeDBotBenchmark?.moveTo(target);
  }, position);
  await nextPaint(page);
};

const measureBotScenario = async (page, scenario) => {
  await repositionBot(page, scenario.start);
  const measurement = await page.evaluate(async options => {
    const benchmark = window.__threeDBotBenchmark;
    if (!benchmark) { throw new Error("Bot benchmark API is unavailable."); }
    const beforeCounts = { ...(window.__fbPerf?.counts || {}) };
    const frameTimes = [];
    let collecting = true;
    let previousFrame;
    let finishFrames;
    const framesFinished = new Promise(resolve => {
      finishFrames = resolve;
    });
    const collectFrame = time => {
      if (previousFrame !== undefined) {
        frameTimes.push(time - previousFrame);
      }
      previousFrame = time;
      if (collecting) {
        requestAnimationFrame(collectFrame);
      } else {
        finishFrames();
      }
    };
    requestAnimationFrame(collectFrame);
    const startedAt = performance.now();
    if (options.idleMs) {
      await new Promise(resolve => setTimeout(resolve, options.idleMs));
    } else if (options.target) {
      await benchmark.moveTo(options.target);
    }
    const elapsedMs = performance.now() - startedAt;
    collecting = false;
    await framesFinished;
    return {
      afterCounts: { ...(window.__fbPerf?.counts || {}) },
      beforeCounts,
      elapsedMs,
      finalPosition: benchmark.position(),
      frameTimes,
    };
  }, {
    idleMs: scenario.idleMs,
    target: scenario.target,
  });
  const summary = summarizeFrameMeasurement(measurement);
  verifyFinalPosition(scenario, summary.finalPosition);
  return summary;
};

const enableBenchmarkWater = async page => {
  await page.evaluate(() => window.__threeDBotBenchmark?.setWater(true));
  await page.waitForFunction(() =>
    window.__threeDBotBenchmark?.config().waterFlow === true,
  { timeout: TIMEOUT });
};

const waitForGardenRender = async (page, beforeRenderCount) => {
  await page.waitForFunction(before => {
    const count = window.__fbPerf?.counts?.["render.GardenModel"] || 0;
    return count > before;
  }, beforeRenderCount, { timeout: 10_000 }).catch(() => undefined);
  await nextPaint(page);
};

const openSoilHeightSection = async page => {
  const section = page.locator(".points-section-header")
    .filter({ hasText: "Soil Height" })
    .first();
  if (await section.count() == 0) { return; }
  await section.click();
  await page.locator(".point-search-item").first()
    .waitFor({ timeout: 10_000 }).catch(() => undefined);
};

const clickAndMeasure = async (
  page,
  route,
  itemSelector,
  panelSelector,
  prepare,
) => {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await waitFor3D(page);
  const item = page.locator(itemSelector).first();
  let count = await item.count();
  if (count == 0 && prepare) {
    await prepare(page);
    count = await item.count();
  }
  if (count == 0) { return undefined; }
  if (!await item.isVisible()) { return undefined; }
  const startedAt = await page.evaluate(() => performance.now());
  await item.click();
  await page.waitForSelector(panelSelector, { timeout: TIMEOUT });
  return page.evaluate(start => performance.now() - start, startedAt);
};

const measureLayerToggle = async (page, labelText) => {
  const toggle = page.locator("fieldset")
    .filter({ hasText: labelText })
    .locator(".fb-layer-toggle")
    .first();
  const count = await toggle.count();
  if (count == 0) { return undefined; }
  if (!await toggle.isVisible()) { return undefined; }
  const beforeRenderCount = await page.evaluate(() =>
    window.__fbPerf?.counts?.["render.GardenModel"] || 0);
  const startedAt = await page.evaluate(() => performance.now());
  await toggle.click();
  await waitForGardenRender(page, beforeRenderCount);
  const elapsed = await page.evaluate(start => performance.now() - start,
    startedAt);
  const beforeRestoreRenderCount = await page.evaluate(() =>
    window.__fbPerf?.counts?.["render.GardenModel"] || 0);
  await toggle.click();
  await waitForGardenRender(page, beforeRestoreRenderCount);
  return elapsed;
};

const ensureLayerVisible = async (page, labelText) => {
  const toggle = page.locator("fieldset")
    .filter({ hasText: labelText })
    .locator(".fb-layer-toggle")
    .first();
  const count = await toggle.count();
  if (count == 0) { return; }
  if (!await toggle.isVisible()) { return; }
  const className = await toggle.getAttribute("class");
  if (className?.includes("green")) { return; }
  const beforeRenderCount = await page.evaluate(() =>
    window.__fbPerf?.counts?.["render.GardenModel"] || 0);
  await toggle.click();
  await waitForGardenRender(page, beforeRenderCount);
};

const collectRun = async (browser, baseUrl, session, runIndex, options) => {
  const context = await browser.newContext({
    viewport: options.viewport,
  });
  await context.addInitScript(value => {
    window.localStorage.setItem("session", value.session);
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    window.localStorage.setItem("FPS_LOGS", "false");
  }, { session });
  const page = await context.newPage();
  page.on("pageerror", error => console.error("pageerror", error));
  page.on("console", message => {
    if (message.type() == "error") {
      console.error("console", message.text());
    }
  });
  page.setDefaultTimeout(TIMEOUT);
  const appUrl = `${baseUrl}/app/designer/plants?fb_perf=1`;
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  await waitFor3D(page);
  if (options.moistureMap) {
    await ensureLayerVisible(page, "Moisture");
  }
  await nextPaint(page);
  const readyCounts = await page.evaluate(() =>
    ({ ...(window.__fbPerf?.counts || {}) }));
  const resources = await resourceSummary(page);
  const renderer = await webglInfo(page);
  const idlePerformance = await measureCpuFramesAndMemory(
    browser,
    page,
    () => page.waitForTimeout(options.sampleMs),
  );
  const idleCounts = await page.evaluate(() =>
    ({ ...(window.__fbPerf?.counts || {}) }));
  const runtime = await runtimeSummary(page);
  const perf = await page.evaluate(() => window.__fbPerf);
  const marks = perf?.marks || {};
  const samples = perf?.samples || {};
  const counts = perf?.counts || {};
  const fpsSamples = samples.fps || [];
  const frameSamples = samples.frame_ms || [];
  const getZSamples = samples.getZMs || [];
  const getZIndexSamples = samples.getZIndexMs || [];
  const soilPointFilterSamples = samples.soilPointFilterMs || [];
  const soilSurfaceSamples = samples.soilSurfaceMs || [];
  const soilStorageSamples = samples.soilStorageMs || [];
  const imageTextureSetupSamples = samples.imageTextureSetupMs || [];
  const imageWrapperSetupSamples = samples.imageWrapperSetupMs || [];
  const spreadFrameUpdateSamples = samples.spreadFrameUpdateMs || [];
  const moistureSurfaceSamples = samples.moistureSurfaceMs || [];
  const moistureInstanceNodeSamples = samples.moistureInstanceNodesMs || [];
  const panelPerformance = await measurePanelTransitions(
    browser,
    page,
    options.panelCycles,
  );
  const readyRenders = renderCounts(readyCounts);
  const idleRenders = renderCountDeltas(readyCounts, idleCounts);
  const panelMetrics = panelRenderMetrics(panelPerformance);
  await page.requestGC();
  const postGcRuntime = await runtimeSummary(page);
  const togglePlantsMs = await measureLayerToggle(page, "Plants");
  const togglePointsMs = await measureLayerToggle(page, "Points");
  const toggleWeedsMs = await measureLayerToggle(page, "Weeds");
  const toggleSpreadMs = await measureLayerToggle(page, "Spread");
  const toggleFarmbotMs = await measureLayerToggle(page, "FarmBot");
  const navPlantMs = await clickAndMeasure(
    page,
    `${baseUrl}/app/designer/plants?fb_perf=1`,
    ".plant-search-item",
    ".plant-info-panel",
  );
  const navPointMs = await clickAndMeasure(
    page,
    `${baseUrl}/app/designer/points?fb_perf=1`,
    ".point-search-item",
    ".point-info-panel",
    openSoilHeightSection,
  );
  const navWeedMs = await clickAndMeasure(
    page,
    `${baseUrl}/app/designer/weeds?fb_perf=1`,
    ".weed-search-item",
    ".weed-info-panel",
  );
  await context.close();
  return {
    runIndex,
    renderer,
    pageReadyMs: firstMark(
      marks,
      "three_d_map_mounted",
      "three_d_garden_mounted",
    ),
    coreReadyMs: firstMark(
      marks,
      "three_d_core_ready",
      "garden_model_rendered",
    ),
    fullReadyMs: maxMark(marks, [
      "three_d_bot_ready",
      "three_d_bed_ready",
      "three_d_grid_ready",
      "three_d_core_ready",
      "three_d_decorations_ready",
      "three_d_details_ready",
      "three_d_visualizations_ready",
      "three_d_camera_ui_ready",
      "three_d_debug_ready",
      "three_d_ground_ready",
      "three_d_moisture_debug_ready",
      "three_d_points_ready",
      "three_d_weeds_ready",
    ]) || marks.garden_model_mounted?.[0],
    fpsMedian: median(fpsSamples),
    idleFpsAverage: idlePerformance.fpsAverage,
    idleFpsMax: idlePerformance.fpsMax,
    idleFrameP95Ms: idlePerformance.frameP95Ms,
    idleCpuTotalMs: idlePerformance.cpuTotalMs,
    idleCpuPercent: idlePerformance.cpuPercent,
    idleRendererCpuMs: idlePerformance.rendererCpuMs,
    idleGpuProcessCpuMs: idlePerformance.gpuProcessCpuMs,
    idleMainThreadTaskMs: idlePerformance.mainThreadTaskMs,
    idleCpuByType: idlePerformance.cpuByType,
    idlePeakRssByType: idlePerformance.peakRssByType,
    idlePeakRendererGpuRssBytes:
      idlePerformance.peakRendererGpuRssBytes,
    panelFpsAverage: panelPerformance.fpsAverage,
    panelFpsMax: panelPerformance.fpsMax,
    panelFrameP95Ms: panelPerformance.frameP95Ms,
    panelCpuTotalMs: panelPerformance.cpuTotalMs,
    panelCpuPercent: panelPerformance.cpuPercent,
    panelRendererCpuMs: panelPerformance.rendererCpuMs,
    panelGpuProcessCpuMs: panelPerformance.gpuProcessCpuMs,
    panelMainThreadTaskMs: panelPerformance.mainThreadTaskMs,
    panelCpuByType: panelPerformance.cpuByType,
    panelPeakRssByType: panelPerformance.peakRssByType,
    panelPeakRendererGpuRssBytes:
      panelPerformance.peakRendererGpuRssBytes,
    panelClickSamples: panelPerformance.clickSamples,
    panelClickToCameraMedianMs:
      panelPerformance.clickToCameraMedianMs,
    panelClickToCameraP95Ms:
      panelPerformance.clickToCameraP95Ms,
    panelClickToNextPaintMedianMs:
      panelPerformance.clickToNextPaintMedianMs,
    panelClickToNextPaintP95Ms:
      panelPerformance.clickToNextPaintP95Ms,
    panelEventDurationMedianMs:
      panelPerformance.eventDurationMedianMs,
    panelEventDurationP95Ms:
      panelPerformance.eventDurationP95Ms,
    panelInputDelayP95Ms: panelPerformance.inputDelayP95Ms,
    panelProcessingP95Ms: panelPerformance.processingP95Ms,
    panelCameraFirstFrameMarks:
      panelPerformance.cameraFirstFrameMarks,
    frameP95Ms: percentile(frameSamples, 95),
    getZBatchMs: getZSamples.reduce((total, value) => total + value, 0),
    getZCalls: getZSamples.length,
    getZIndexMs: getZIndexSamples
      .reduce((total, value) => total + value, 0),
    getZP95Ms: percentile(getZSamples, 95),
    soilPointFilterMs: soilPointFilterSamples
      .reduce((total, value) => total + value, 0),
    soilSurfaceMs: soilSurfaceSamples
      .reduce((total, value) => total + value, 0),
    soilStorageMs: soilStorageSamples
      .reduce((total, value) => total + value, 0),
    soilStorageCalls: soilStorageSamples.length,
    imageTextureSetupMs: imageTextureSetupSamples
      .reduce((total, value) => total + value, 0),
    imageWrapperSetupMs: imageWrapperSetupSamples
      .reduce((total, value) => total + value, 0),
    soilTextureRenders: counts.soilTextureRenders || 0,
    spreadFrameUpdateMs: spreadFrameUpdateSamples
      .reduce((total, value) => total + value, 0),
    moistureSurfaceMs: moistureSurfaceSamples
      .reduce((total, value) => total + value, 0),
    moistureInstanceNodesMs: moistureInstanceNodeSamples
      .reduce((total, value) => total + value, 0),
    navPlantMs,
    navPointMs,
    navWeedMs,
    togglePlantsMs,
    togglePointsMs,
    toggleWeedsMs,
    toggleSpreadMs,
    toggleFarmbotMs,
    ...resources,
    ...runtime,
    postGcUsedJSHeapSize: postGcRuntime.usedJSHeapSize,
    readyThreeDGardenMapRenders: readyRenders.ThreeDGardenMap,
    readyGardenModelRenders: readyRenders.GardenModel,
    readyThreeDGardenRenders: readyRenders.ThreeDGarden,
    readyGardenCameraRigRenders: readyRenders.GardenCameraRig,
    readyPanelCameraControllerRenders:
      readyRenders.PanelCameraController,
    idleThreeDGardenMapRenders: idleRenders.ThreeDGardenMap,
    idleGardenModelRenders: idleRenders.GardenModel,
    idleThreeDGardenRenders: idleRenders.ThreeDGarden,
    idleGardenCameraRigRenders: idleRenders.GardenCameraRig,
    idlePanelCameraControllerRenders:
      idleRenders.PanelCameraController,
    ...panelMetrics,
    plantInventoryItemRenders: counts["render.PlantInventoryItem"],
  };
};

const collectMovementRun = async (
  browser,
  baseUrl,
  session,
  runIndex,
  viewport,
) => {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(value => {
    window.localStorage.setItem("session", value.session);
    window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
    window.localStorage.setItem("FPS_LOGS", "false");
  }, { session });
  const page = await context.newPage();
  page.on("pageerror", error => console.error("pageerror", error));
  page.on("console", message => {
    if (message.type() == "error") {
      console.error("console", message.text());
    }
  });
  page.setDefaultTimeout(TIMEOUT);
  await page.goto(`${baseUrl}/app/designer/plants?fb_perf=1`, {
    waitUntil: "domcontentloaded",
  });
  await waitFor3D(page);
  await waitForBotBenchmark(page);
  await nextPaint(page);
  const config = await page.evaluate(() =>
    window.__threeDBotBenchmark?.config());
  if (!config?.trail || !config.cableCarriers) {
    throw new Error(
      `Unexpected movement benchmark config: ${JSON.stringify(config)}`,
    );
  }
  const scenarios = {};
  for (const scenario of MOVEMENT_SCENARIOS) {
    console.log(`movement scenario: ${scenario.name}`);
    scenarios[scenario.name] = await measureBotScenario(page, scenario);
  }
  console.log("movement scenario: enabling water");
  await enableBenchmarkWater(page);
  console.log(`movement scenario: ${WATER_MOVEMENT_SCENARIO.name}`);
  scenarios[WATER_MOVEMENT_SCENARIO.name] = await measureBotScenario(
    page,
    WATER_MOVEMENT_SCENARIO,
  );
  const runtimeBeforeRepeatGC = await runtimeSummary(page);
  await page.requestGC();
  const runtimeBeforeRepeat = await runtimeSummary(page);
  await measureBotScenario(page, WATER_MOVEMENT_SCENARIO);
  const runtimeAfterRepeatGC = await runtimeSummary(page);
  await page.requestGC();
  const runtimeAfterRepeat = await runtimeSummary(page);
  await context.close();
  return {
    runIndex,
    config,
    scenarios,
    runtimeBeforeRepeatGC,
    runtimeBeforeRepeat,
    runtimeAfterRepeatGC,
    runtimeAfterRepeat,
    geometryGrowth:
      runtimeAfterRepeat.webglGeometries -
      runtimeBeforeRepeat.webglGeometries,
    objectGrowth:
      runtimeAfterRepeat.sceneObjects - runtimeBeforeRepeat.sceneObjects,
    postGCHeapGrowth:
      runtimeAfterRepeat.usedJSHeapSize - runtimeBeforeRepeat.usedJSHeapSize,
  };
};

const runMovementBenchmark = async args => {
  const baseUrl = args["base-url"] || DEFAULT_URL;
  const runs = Number(args.runs || 5);
  const warmups = Number(args.warmups || 1);
  const out = args.out || "tmp/perf/bot_movement_3d.json";
  const productLine = args["product-line"] || MOVEMENT_PRODUCT_LINE;
  const viewport = {
    width: Number(args.width || MOVEMENT_VIEWPORT.width),
    height: Number(args.height || MOVEMENT_VIEWPORT.height),
  };
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-frame-rate-limit",
      "--disable-gpu-vsync",
      "--enable-gpu",
    ],
  });
  try {
    const session = await createDemoSession(browser, baseUrl, productLine);
    await apiJson(baseUrl, session, "/api/web_app_config/", {
      method: "PUT",
      body: JSON.stringify({
        display_trail: true,
        three_d_garden: true,
      }),
    });
    await setFarmwareEnv(
      baseUrl,
      session,
      "3D_cableCarriers",
      "1",
    );
    const measuredRuns = [];
    for (let i = 0; i < warmups + runs; i++) {
      const run = await collectMovementRun(
        browser,
        baseUrl,
        session,
        i,
        viewport,
      );
      console.log(`${i < warmups ? "warmup" : "run"} ${i + 1}`, run);
      if (i >= warmups) { measuredRuns.push(run); }
    }
    const result = {
      productLine,
      createdAt: new Date().toISOString(),
      source: sourceProvenance(),
      viewport,
      runs: measuredRuns,
      summary: movementSummary(measuredRuns),
      geometryGrowth: median(measuredRuns.map(run => run.geometryGrowth)),
      objectGrowth: median(measuredRuns.map(run => run.objectGrowth)),
      postGCHeapGrowth: median(measuredRuns
        .map(run => run.postGCHeapGrowth)),
    };
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `${JSON.stringify(result, undefined, 2)}\n`);
    console.log(`Wrote ${out}`);
    console.log(result.summary);
  } finally {
    await browser.close();
  }
};

const runBenchmark = async args => {
  const baseUrl = args["base-url"] || DEFAULT_URL;
  const runs = Number(args.runs || 5);
  const warmups = Number(args.warmups || 1);
  const out = args.out || "tmp/perf/stress_1000_3d.json";
  const lowDetail = ["1", "true"].includes(args["low-detail"]);
  const viewport = {
    width: Number(args.width || DEFAULT_VIEWPORT.width),
    height: Number(args.height || DEFAULT_VIEWPORT.height),
  };
  const sampleMs = Number(args["sample-ms"] || DEFAULT_SAMPLE_MS);
  const panelCycles = Number(args["panel-cycles"] || 10);
  const uncapped = !["0", "false"].includes(args.uncapped);
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      ...(uncapped ? [
        "--disable-frame-rate-limit",
        "--disable-gpu-vsync",
      ] : []),
      "--enable-gpu",
    ],
  });
  try {
    const session = await createDemoSession(browser, baseUrl);
    if (lowDetail) {
      await setFarmwareEnv(baseUrl, session, "3D_lowDetail", "1");
    }
    if (["1", "true"].includes(args["moisture-map"])) {
      await apiJson(baseUrl, session, "/api/web_app_config/", {
        method: "PUT",
        body: JSON.stringify({
          show_sensor_readings: true,
          show_moisture_interpolation_map: true,
        }),
      });
    }
    const measuredRuns = [];
    for (let i = 0; i < warmups + runs; i++) {
      const run = await collectRun(browser, baseUrl, session, i, {
        viewport,
        sampleMs,
        panelCycles,
        moistureMap: ["1", "true"].includes(args["moisture-map"]),
      });
      console.log(`${i < warmups ? "warmup" : "run"} ${i + 1}`, run);
      if (i >= warmups) { measuredRuns.push(run); }
    }
    const result = {
      productLine: PRODUCT_LINE,
      createdAt: new Date().toISOString(),
      source: sourceProvenance(),
      viewport,
      sampleMs,
      panelCycles,
      uncapped,
      renderer: measuredRuns[0]?.renderer,
      runs: measuredRuns,
      summary: summary(measuredRuns),
    };
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, `${JSON.stringify(result, undefined, 2)}\n`);
    console.log(`Wrote ${out}`);
    console.log(result.summary);
  } finally {
    await browser.close();
  }
};

const getSession = async (browser, baseUrl, sessionFile) => {
  if (sessionFile && fs.existsSync(sessionFile)) {
    return fs.readFileSync(sessionFile, "utf8");
  }
  const session = await createDemoSession(browser, baseUrl);
  if (sessionFile) {
    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
    fs.writeFileSync(sessionFile, session);
  }
  return session;
};

const screenshot = async args => {
  const baseUrl = args["base-url"] || DEFAULT_URL;
  const out = args.out || "tmp/perf/three_d_garden.png";
  const viewport = {
    width: Number(args.width || DEFAULT_VIEWPORT.width),
    height: Number(args.height || DEFAULT_VIEWPORT.height),
  };
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--enable-gpu",
    ],
  });
  try {
    const session = await getSession(browser, baseUrl, args["session-file"]);
    const context = await browser.newContext({ viewport });
    await context.addInitScript(value => {
      window.localStorage.setItem("session", value.session);
      window.localStorage.setItem("FB_PERF_BENCHMARK", "true");
      window.localStorage.setItem("FPS_LOGS", "false");
    }, { session });
    const page = await context.newPage();
    page.setDefaultTimeout(TIMEOUT);
    await page.goto(`${baseUrl}/app/designer/plants?fb_perf=1`, {
      waitUntil: "domcontentloaded",
    });
    await waitFor3D(page);
    await page.waitForTimeout(Number(args["settle-ms"] || 3_000));
    await nextPaint(page);
    const canvas = page.locator(".garden-bed-3d-model canvas").first();
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await canvas.screenshot({ path: out });
    await context.close();
    console.log(`Wrote ${out}`);
  } finally {
    await browser.close();
  }
};

const imageDiff = async args => {
  const before = fs.readFileSync(args.before, "base64");
  const after = fs.readFileSync(args.after, "base64");
  const threshold = Number(args.threshold || 3);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const result = await page.evaluate(async ({ before, after, threshold }) => {
      const load = data => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = `data:image/png;base64,${data}`;
      });
      const [beforeImage, afterImage] =
        await Promise.all([load(before), load(after)]);
      const width = beforeImage.width;
      const height = beforeImage.height;
      if (width != afterImage.width || height != afterImage.height) {
        throw new Error("Image dimensions differ.");
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(beforeImage, 0, 0);
      const beforePixels =
        context.getImageData(0, 0, width, height).data;
      context.clearRect(0, 0, width, height);
      context.drawImage(afterImage, 0, 0);
      const afterPixels =
        context.getImageData(0, 0, width, height).data;
      let diffPixels = 0;
      let maxDelta = 0;
      let totalDelta = 0;
      for (let i = 0; i < beforePixels.length; i += 4) {
        const delta = Math.max(
          Math.abs(beforePixels[i] - afterPixels[i]),
          Math.abs(beforePixels[i + 1] - afterPixels[i + 1]),
          Math.abs(beforePixels[i + 2] - afterPixels[i + 2]),
          Math.abs(beforePixels[i + 3] - afterPixels[i + 3]),
        );
        maxDelta = Math.max(maxDelta, delta);
        totalDelta += delta;
        if (delta > threshold) { diffPixels++; }
      }
      const pixels = width * height;
      return {
        width,
        height,
        pixels,
        diffPixels,
        diffRatio: diffPixels / pixels,
        maxDelta,
        avgDelta: totalDelta / pixels,
      };
    }, { before, after, threshold });
    console.log(result);
    if (result.diffPixels > 0) { process.exitCode = 1; }
  } finally {
    await browser.close();
  }
};

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));

const compare = args => {
  const before = readJson(args.before);
  const after = readJson(args.after);
  const metric = args.metric;
  const direction = args.direction || (
    ["fpsMedian"].includes(metric) ? "up" : "down");
  const threshold = Number(args.threshold || 10);
  const beforeValue = before.summary[metric];
  const afterValue = after.summary[metric];
  if (!Number.isFinite(beforeValue) || !Number.isFinite(afterValue)) {
    throw new Error(`Metric ${metric} is missing from benchmark results.`);
  }
  const improvement = direction == "up"
    ? 100 * (afterValue - beforeValue) / beforeValue
    : 100 * (beforeValue - afterValue) / beforeValue;
  console.log({
    metric,
    direction,
    before: beforeValue,
    after: afterValue,
    improvement: `${improvement.toFixed(2)}%`,
    threshold: `${threshold}%`,
  });
  if (improvement < threshold) {
    process.exitCode = 1;
  }
};

const main = async () => {
  const args = parseArgs();
  if (args.command == "compare") {
    compare(args);
  } else if (args.command == "movement") {
    await runMovementBenchmark(args);
  } else if (args.command == "screenshot") {
    await screenshot(args);
  } else if (args.command == "image-diff") {
    await imageDiff(args);
  } else {
    await runBenchmark(args);
  }
};

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
