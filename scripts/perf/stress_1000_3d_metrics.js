const { execFileSync } = require("child_process");

const RENDER_COUNT_METRICS = {
  ThreeDGardenMap: "render.ThreeDGardenMap",
  ThreeDGarden: "render.ThreeDGarden",
  GardenModel: "render.GardenModel",
  GardenCameraRig: "render.GardenCameraRig",
  PanelCameraController: "render.PanelCameraController",
};

const PANEL_CAUSE_PREFIXES = [
  "change.",
  "gardenCamera.",
  "panelCamera.",
];

const median = values => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (sorted.length == 0) { return undefined; }
  return sorted[Math.floor(sorted.length / 2)];
};

const renderCounts = counts => Object.fromEntries(
  Object.entries(RENDER_COUNT_METRICS)
    .map(([name, key]) => [name, counts[key] || 0]),
);

const renderCountDeltas = (before, after) => Object.fromEntries(
  Object.entries(RENDER_COUNT_METRICS)
    .map(([name, key]) => [
      name,
      (after[key] || 0) - (before[key] || 0),
    ]),
);

const countDeltas = (before, after, prefixes) => Object.fromEntries(
  [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(key => prefixes.some(prefix => key.startsWith(prefix)))
    .map(key => [key, (after[key] || 0) - (before[key] || 0)])
    .filter(([, value]) => value != 0),
);

const medianObjectMetric = (runs, key) => {
  const keys = new Set(runs.flatMap(run => Object.keys(run[key] || {})));
  return Object.fromEntries([...keys].map(objectKey => [
    objectKey,
    median(runs.map(run => run[key]?.[objectKey] || 0)),
  ]));
};

const gitOutput = args => {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
};

const sourceProvenance = (runGit = gitOutput) => {
  const status = runGit(["status", "--porcelain"]);
  return {
    gitHead: runGit(["rev-parse", "HEAD"]),
    gitBranch: runGit(["branch", "--show-current"]),
    gitDirty: status === undefined ? undefined : status.length > 0,
  };
};

const summary = runs => {
  const metric = key => median(runs.map(run => run[key]));
  return {
    pageReadyMs: metric("pageReadyMs"),
    coreReadyMs: metric("coreReadyMs"),
    fullReadyMs: metric("fullReadyMs"),
    fpsMedian: metric("fpsMedian"),
    idleFpsAverage: metric("idleFpsAverage"),
    idleFpsMax: metric("idleFpsMax"),
    idleFrameP95Ms: metric("idleFrameP95Ms"),
    idleCpuTotalMs: metric("idleCpuTotalMs"),
    idleCpuPercent: metric("idleCpuPercent"),
    idleRendererCpuMs: metric("idleRendererCpuMs"),
    idleGpuProcessCpuMs: metric("idleGpuProcessCpuMs"),
    idleMainThreadTaskMs: metric("idleMainThreadTaskMs"),
    idlePeakRendererGpuRssBytes:
      metric("idlePeakRendererGpuRssBytes"),
    panelFpsAverage: metric("panelFpsAverage"),
    panelFpsMax: metric("panelFpsMax"),
    panelFrameP95Ms: metric("panelFrameP95Ms"),
    panelCpuTotalMs: metric("panelCpuTotalMs"),
    panelCpuPercent: metric("panelCpuPercent"),
    panelRendererCpuMs: metric("panelRendererCpuMs"),
    panelGpuProcessCpuMs: metric("panelGpuProcessCpuMs"),
    panelMainThreadTaskMs: metric("panelMainThreadTaskMs"),
    panelPeakRendererGpuRssBytes:
      metric("panelPeakRendererGpuRssBytes"),
    panelClickToCameraMedianMs: metric("panelClickToCameraMedianMs"),
    panelClickToCameraP95Ms: metric("panelClickToCameraP95Ms"),
    panelClickToNextPaintMedianMs:
      metric("panelClickToNextPaintMedianMs"),
    panelClickToNextPaintP95Ms:
      metric("panelClickToNextPaintP95Ms"),
    panelEventDurationMedianMs: metric("panelEventDurationMedianMs"),
    panelEventDurationP95Ms: metric("panelEventDurationP95Ms"),
    panelInputDelayP95Ms: metric("panelInputDelayP95Ms"),
    panelProcessingP95Ms: metric("panelProcessingP95Ms"),
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
    modelEncodedBytes: metric("modelEncodedBytes"),
    modelTransferBytes: metric("modelTransferBytes"),
    modelResourceCount: metric("modelResourceCount"),
    readyThreeDGardenMapRenders:
      metric("readyThreeDGardenMapRenders"),
    readyGardenModelRenders: metric("readyGardenModelRenders"),
    readyThreeDGardenRenders: metric("readyThreeDGardenRenders"),
    readyGardenCameraRigRenders:
      metric("readyGardenCameraRigRenders"),
    readyPanelCameraControllerRenders:
      metric("readyPanelCameraControllerRenders"),
    idleThreeDGardenMapRenders:
      metric("idleThreeDGardenMapRenders"),
    idleGardenModelRenders: metric("idleGardenModelRenders"),
    idleThreeDGardenRenders: metric("idleThreeDGardenRenders"),
    idleGardenCameraRigRenders:
      metric("idleGardenCameraRigRenders"),
    idlePanelCameraControllerRenders:
      metric("idlePanelCameraControllerRenders"),
    panelThreeDGardenMapRenders:
      metric("panelThreeDGardenMapRenders"),
    panelGardenModelRenders: metric("panelGardenModelRenders"),
    panelThreeDGardenRenders: metric("panelThreeDGardenRenders"),
    panelGardenCameraRigRenders:
      metric("panelGardenCameraRigRenders"),
    panelCameraControllerRenders:
      metric("panelCameraControllerRenders"),
    panelCameraFirstFrameMarks:
      metric("panelCameraFirstFrameMarks"),
    panelCameraSpringFrames: metric("panelCameraSpringFrames"),
    gardenCameraSpringFrames: metric("gardenCameraSpringFrames"),
    panelRenderCauses: medianObjectMetric(runs, "panelRenderCauses"),
    panelAttributableRenders:
      medianObjectMetric(runs, "panelAttributableRenders"),
    plantInventoryItemRenders: metric("plantInventoryItemRenders"),
    drawCalls: metric("drawCalls"),
    triangles: metric("triangles"),
    webglGeometries: metric("webglGeometries"),
    webglTextures: metric("webglTextures"),
    sceneObjects: metric("sceneObjects"),
    sceneMeshes: metric("sceneMeshes"),
    sceneInstancedMeshes: metric("sceneInstancedMeshes"),
    usedJSHeapSize: metric("usedJSHeapSize"),
    totalJSHeapSize: metric("totalJSHeapSize"),
    postGcUsedJSHeapSize: metric("postGcUsedJSHeapSize"),
    getZBatchMs: metric("getZBatchMs"),
    getZCalls: metric("getZCalls"),
    getZIndexMs: metric("getZIndexMs"),
    getZP95Ms: metric("getZP95Ms"),
    soilPointFilterMs: metric("soilPointFilterMs"),
    soilSurfaceMs: metric("soilSurfaceMs"),
    soilStorageMs: metric("soilStorageMs"),
    soilStorageCalls: metric("soilStorageCalls"),
    imageTextureSetupMs: metric("imageTextureSetupMs"),
    imageWrapperSetupMs: metric("imageWrapperSetupMs"),
    soilTextureRenders: metric("soilTextureRenders"),
    spreadFrameUpdateMs: metric("spreadFrameUpdateMs"),
    moistureSurfaceMs: metric("moistureSurfaceMs"),
    moistureInstanceNodesMs: metric("moistureInstanceNodesMs"),
  };
};

const panelRenderMetrics = (panelPerformance = {}) => {
  const renders = panelPerformance.renderDeltas || {};
  const causes = panelPerformance.causeDeltas || {};
  const mapCascades =
    causes["change.ThreeDGardenMap.designer"] || 0;
  const modelCascades = (
    causes["change.GardenModel.route"] || 0
  ) + (
    causes["change.GardenModel.viewport"] || 0
  );
  return {
    panelThreeDGardenMapRenders: renders.ThreeDGardenMap,
    panelGardenModelRenders: renders.GardenModel,
    panelThreeDGardenRenders: renders.ThreeDGarden,
    panelGardenCameraRigRenders: renders.GardenCameraRig,
    panelCameraControllerRenders: renders.PanelCameraController,
    panelCameraSpringFrames:
      causes["panelCamera.springFrame"] || 0,
    gardenCameraSpringFrames:
      causes["gardenCamera.springFrame"] || 0,
    panelRenderCauses: causes,
    panelAttributableRenders: {
      ThreeDGardenMap: mapCascades,
      ThreeDGarden: mapCascades,
      GardenModel: modelCascades,
      GardenCameraRig:
        causes["change.GardenCameraRig.cameraRequest"] || 0,
    },
  };
};

module.exports = {
  PANEL_CAUSE_PREFIXES,
  RENDER_COUNT_METRICS,
  countDeltas,
  median,
  medianObjectMetric,
  panelRenderMetrics,
  renderCountDeltas,
  renderCounts,
  sourceProvenance,
  summary,
};
