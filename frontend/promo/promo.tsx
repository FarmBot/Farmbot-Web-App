import React from "react";
import {
  Config, ConfigWithPosition, INITIAL, modifyConfigsFromUrlParams,
  PRESETS,
} from "../three_d_garden/config";
import { GardenModel } from "../three_d_garden/garden_model";
import { Canvas } from "@react-three/fiber";
import {
  PrivateOverlay, PublicOverlay, ToolTip,
} from "../three_d_garden/config_overlays";
import { ASSETS } from "../three_d_garden/constants";
import {
  getFocusFromUrlParams, setUrlParam,
} from "../three_d_garden/zoom_beacons_constants";
import { MemoryRouter } from "react-router";
import { calculatePlantPositions } from "./plants";
import { ThreeDGardenPlant } from "../three_d_garden/garden";
import { TaggedGenericPointer } from "farmbot";
import { calculatePointPositions } from "./points";
import { SEASON_TIMINGS, SEASONS } from "./constants";
import { isMobile } from "../screen_size";
import { FocusTransitionProvider } from "../three_d_garden/focus_transition";
import {
  PROMO_PLANT_ICON_ATLAS,
} from "../three_d_garden/garden/plant_icon_atlas";
import {
  getPromoResourcePlants, getPromoResourcePoints, getPromoResourceWeeds,
} from "./resources";

const PROMO_BED_SIZES = [
  {
    length: PRESETS["Genesis"].bedLengthOuter,
    width: PRESETS["Genesis"].bedWidthOuter,
  },
  {
    length: PRESETS["Genesis XL"].bedLengthOuter,
    width: PRESETS["Genesis XL"].bedWidthOuter,
  },
];

type ThreeDPlantsCache = Record<string, ThreeDGardenPlant[]>;
const PLANTS_CACHE: ThreeDPlantsCache = {};
interface PromoPlantCapacities {
  iconCapacities: Record<string, number>;
  plantInstanceCapacity: number;
}

const calcCacheKey = (config: Config): string =>
  `${config.bedLengthOuter}x${config.bedWidthOuter}: ${config.plants}`;

const addPlantsToCache = (
  cache: ThreeDPlantsCache,
  config: Config,
): ThreeDPlantsCache => {
  return {
    ...cache,
    [calcCacheKey(config)]: calculatePlantPositions(config),
  };
};

const prewarmPlantsCache = () => {
  let next = PLANTS_CACHE;
  PROMO_BED_SIZES.map(({ length, width }) => {
    SEASONS.map(season => {
      next = addPlantsToCache(next, {
        ...INITIAL,
        bedLengthOuter: length,
        bedWidthOuter: width,
        plants: season,
      });
    });
  });
  Object.assign(PLANTS_CACHE, next);
};

const getCachedPlants = (config: Config) => {
  const cacheKey = calcCacheKey(config);
  const cachedPlants = PLANTS_CACHE[cacheKey];
  if (cachedPlants) { return cachedPlants; }

  const plants = calculatePlantPositions(config);
  Object.assign(PLANTS_CACHE, { [cacheKey]: plants });
  return plants;
};

export const getPromoPlantCapacities = (config: Config): PromoPlantCapacities => {
  const iconCapacities: Record<string, number> = {};
  let plantInstanceCapacity = 0;
  SEASONS.map(season => {
    PROMO_BED_SIZES.map(({ length, width }) => {
      const plants = getCachedPlants({
        ...config,
        bedLengthOuter: length,
        bedWidthOuter: width,
        plants: season,
      });
      plantInstanceCapacity = Math.max(plantInstanceCapacity, plants.length);
      const iconCounts: Record<string, number> = {};
      plants.map(plant => {
        iconCounts[plant.icon] = (iconCounts[plant.icon] || 0) + 1;
      });
      Object.entries(iconCounts).map(([icon, count]) => {
        iconCapacities[icon] = Math.max(iconCapacities[icon] || 0, count);
      });
    });
  });
  return { iconCapacities, plantInstanceCapacity };
};

prewarmPlantsCache();

export const getSeasonTimings = (currentSeason: string, step = 0) => {
  const seasons = SEASON_TIMINGS.map(s => s.season);
  const seasonIndex = seasons.indexOf(currentSeason);
  const validSeasonIndex = seasonIndex >= 0 ? seasonIndex : 0;
  const selectedSeasonIndex = (validSeasonIndex + step) % seasons.length;
  const selectedSeasonTimings = SEASON_TIMINGS[selectedSeasonIndex];
  return selectedSeasonTimings;
};

export const Promo = () => {
  const [config, setConfig] = React.useState<ConfigWithPosition>(() => {
    let next = INITIAL;
    if (isMobile()) {
      next = { ...next, viewpointHeading: 80 };
    }
    next = modifyConfigsFromUrlParams(next);
    return next;
  });
  const [toolTip, setToolTip] = React.useState<ToolTip>({ timeoutId: 0, text: "" });
  const [activeFocus, setActiveFocus] = React.useState(() =>
    getFocusFromUrlParams());
  const [threeDLoaded, setThreeDLoaded] = React.useState(false);
  const [seasonAnimationPaused, setSeasonAnimationPaused] =
    React.useState(false);
  const [seasonResetKey, setSeasonResetKey] = React.useState(0);
  const handleThreeDLoadComplete = React.useCallback(() =>
    setThreeDLoaded(true), []);
  const handleSeasonSelect = React.useCallback(() =>
    setSeasonResetKey(key => key + 1), []);
  const common = {
    config, setConfig,
    toolTip, setToolTip,
    activeFocus, setActiveFocus,
  };

  const mapPoints = React.useMemo<TaggedGenericPointer[]>(() =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    getPromoResourcePoints() || calculatePointPositions(config), [
    config.soilSurface, config.soilHeight, config.soilSurfacePointCount,
    config.soilSurfaceVariance, config.bedXOffset, config.bedYOffset,
    config.bedWallThickness, config.bedLengthOuter, config.bedWidthOuter,
  ]);

  const startTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    startTimeRef.current = performance.now() / 1000;
  }, []);

  React.useEffect(() => {
    if (!config.animateSeasons) { return; }
    const currentSeasonTimings = getSeasonTimings(config.plants);
    const totalSeconds =
      currentSeasonTimings.duration + currentSeasonTimings.pause;
    const elapsedSeconds = Math.min(
      Math.max(performance.now() / 1000 - startTimeRef.current, 0),
      totalSeconds,
    );
    const remainingSeconds = totalSeconds - elapsedSeconds;
    const timeout = setTimeout(() => {
      startTimeRef.current = performance.now() / 1000;
      setConfig(prevConfig => {
        const nextSeasonTimings = getSeasonTimings(prevConfig.plants, 1);
        return {
          ...prevConfig,
          plants: nextSeasonTimings.season,
        };
      });
    }, remainingSeconds * 1000);
    return () => clearTimeout(timeout);
  }, [config.plants, config.animateSeasons]);

  const clearActiveFocus = React.useCallback(() => {
    setActiveFocus("");
    setUrlParam("focus", "");
  }, []);

  React.useEffect(() => {
    if (!activeFocus) { return; }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key != "Escape") { return; }
      clearActiveFocus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFocus, clearActiveFocus]);

  const plants = React.useMemo(() => {
    return getPromoResourcePlants() || getCachedPlants(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.plants, config.bedLengthOuter, config.bedWidthOuter]);
  const weeds = React.useMemo(() => getPromoResourceWeeds() || [], []);

  const threeDPlants = React.useMemo(() => {
    return config.promoSpread
      ? plants.map(plant => ({ ...plant, id: 0 }))
      : plants;
  }, [plants, config.promoSpread]);
  const plantCapacityConfig = React.useMemo(() => ({
    ...INITIAL,
    bedLengthOuter: config.bedLengthOuter,
    bedWidthOuter: config.bedWidthOuter,
  }), [config.bedLengthOuter, config.bedWidthOuter]);
  const plantCapacities = React.useMemo(() =>
    getPromoPlantCapacities(plantCapacityConfig), [plantCapacityConfig]);
  const gardenConfig = React.useMemo(() =>
    seasonAnimationPaused
      ? { ...config, animateSeasons: true }
      : config, [config, seasonAnimationPaused]);

  return <div className={"three-d-garden promo"}
    onKeyDown={e => activeFocus && e.key == "Escape" && clearActiveFocus()}>
    <div className={"garden-bed-3d-model"}>
      <FocusTransitionProvider enabled={config.animate}>
        <MemoryRouter>
          <Canvas
            shadows={"variance"}
            onCreated={({ gl }) => {
              gl.localClippingEnabled = true;
            }}>
            <GardenModel {...common}
              config={gardenConfig}
              configPosition={{ x: config.x, y: config.y, z: config.z }}
              startTimeRef={startTimeRef}
              threeDPlants={threeDPlants}
              mapPoints={mapPoints}
              weeds={weeds}
              plantIconCapacities={plantCapacities.iconCapacities}
              plantIconAtlas={PROMO_PLANT_ICON_ATLAS}
              plantInstanceCapacity={plantCapacities.plantInstanceCapacity}
              seasonResetKey={seasonResetKey}
              promo={true}
              preloadEnvironmentScenes={true}
              showFarmbotLayerLoadProgress={false}
              onDetailsRevealStart={handleThreeDLoadComplete}
              smoothFocusTransitions={true}
              smoothConfigTransitions={true} />
          </Canvas>
        </MemoryRouter>
        <PublicOverlay {...common}
          loadComplete={threeDLoaded}
          startTimeRef={startTimeRef}
          seasonAnimationPaused={seasonAnimationPaused}
          setSeasonAnimationPaused={setSeasonAnimationPaused}
          onSeasonSelect={handleSeasonSelect} />
        {!config.config &&
          <img className={"gear"} src={ASSETS.other.gear} title={"config"}
            onClick={() => setConfig({ ...config, config: true })} />}
        {config.config &&
          <PrivateOverlay {...common}
            startTimeRef={startTimeRef}
            seasonAnimationPaused={seasonAnimationPaused}
            setSeasonAnimationPaused={setSeasonAnimationPaused}
            onSeasonSelect={handleSeasonSelect} />}
        <span className={"tool-tip"} hidden={!toolTip.text}>
          {toolTip.text}
        </span>
      </FocusTransitionProvider>
    </div>
  </div>;
};
