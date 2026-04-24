const { chromium } = require("playwright");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_URL = "http://localhost:3000";
const PRODUCT_LINE = "genesis_xl_1.8_stress_1000";
const DEMO_USER = "farmbot_demo";
const TIMEOUT = 180_000;
const DEFAULT_VIEWPORT = { width: 3840, height: 2160 };
const DEFAULT_SAMPLE_MS = 12_000;

const parseArgs = () => {
  const [command = "run", ...rest] = process.argv.slice(2);
  const args = { command };
  for (let i = 0; i < rest.length; i += 2) {
    args[rest[i].replace(/^--/, "")] = rest[i + 1];
  }
  return args;
};

const median = values => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length == 0) { return undefined; }
  return sorted[Math.floor(sorted.length / 2)];
};

const percentile = (values, p) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length == 0) { return undefined; }
  return sorted[Math.ceil((p / 100) * sorted.length) - 1];
};

const summary = runs => {
  const metric = key => median(runs.map(run => run[key]));
  return {
    pageReadyMs: metric("pageReadyMs"),
    coreReadyMs: metric("coreReadyMs"),
    fullReadyMs: metric("fullReadyMs"),
    fpsMedian: metric("fpsMedian"),
    frameP95Ms: metric("frameP95Ms"),
    navPlantMs: metric("navPlantMs"),
    navPointMs: metric("navPointMs"),
    navWeedMs: metric("navWeedMs"),
    togglePlantsMs: metric("togglePlantsMs"),
    togglePointsMs: metric("togglePointsMs"),
    toggleWeedsMs: metric("toggleWeedsMs"),
    toggleSpreadMs: metric("toggleSpreadMs"),
    toggleFarmbotMs: metric("toggleFarmbotMs"),
    jsEncodedBytes: metric("jsEncodedBytes"),
    jsTransferBytes: metric("jsTransferBytes"),
    jsResourceCount: metric("jsResourceCount"),
    threeDGardenMapRenders: metric("threeDGardenMapRenders"),
    gardenModelRenders: metric("gardenModelRenders"),
    threeDGardenRenders: metric("threeDGardenRenders"),
    plantInventoryItemRenders: metric("plantInventoryItemRenders"),
  };
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
  const sum = key => jsResources
    .reduce((total, entry) => total + (entry[key] || 0), 0);
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
  };
});

const createDemoSession = async (browser, baseUrl) => {
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
    line: PRODUCT_LINE,
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
  page.setDefaultTimeout(TIMEOUT);
  const appUrl = `${baseUrl}/app/designer/plants?fb_perf=1`;
  await page.goto(appUrl, { waitUntil: "domcontentloaded" });
  await waitFor3D(page);
  await nextPaint(page);
  const resources = await resourceSummary(page);
  await page.waitForTimeout(options.sampleMs);
  const perf = await page.evaluate(() => window.__fbPerf);
  const marks = perf?.marks || {};
  const samples = perf?.samples || {};
  const counts = perf?.counts || {};
  const fpsSamples = samples.fps || [];
  const frameSamples = samples.frame_ms || [];
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
    frameP95Ms: percentile(frameSamples, 95),
    navPlantMs,
    navPointMs,
    navWeedMs,
    togglePlantsMs,
    togglePointsMs,
    toggleWeedsMs,
    toggleSpreadMs,
    toggleFarmbotMs,
    ...resources,
    threeDGardenMapRenders: counts["render.ThreeDGardenMap"],
    gardenModelRenders: counts["render.GardenModel"],
    threeDGardenRenders: counts["render.ThreeDGarden"],
    plantInventoryItemRenders: counts["render.PlantInventoryItem"],
  };
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
    const session = await createDemoSession(browser, baseUrl);
    if (lowDetail) {
      await setFarmwareEnv(baseUrl, session, "3D_lowDetail", "1");
    }
    const measuredRuns = [];
    for (let i = 0; i < warmups + runs; i++) {
      const run = await collectRun(browser, baseUrl, session, i, {
        viewport,
        sampleMs,
      });
      console.log(`${i < warmups ? "warmup" : "run"} ${i + 1}`, run);
      if (i >= warmups) { measuredRuns.push(run); }
    }
    const result = {
      productLine: PRODUCT_LINE,
      createdAt: new Date().toISOString(),
      viewport,
      sampleMs,
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
  } else {
    await runBenchmark(args);
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
