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

const calcPlantsCache = (
  cache: ThreeDPlantsCache,
  config: Config,
): ThreeDPlantsCache => {
  const cacheKey = calcCacheKey(config);
  if (cache[cacheKey]) {
    return cache;
  }
  return {
    ...cache,
    [cacheKey]: calculatePlantPositions(config),
  };
};

const prewarmPlantsCache = () => {
  let next = PLANTS_CACHE;
  PROMO_BED_SIZES.map(({ length, width }) => {
    SEASONS.map(season => {
      next = calcPlantsCache(next, {
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

  Object.assign(PLANTS_CACHE, calcPlantsCache(PLANTS_CACHE, config));
  return PLANTS_CACHE[cacheKey] || [];
};

export const getPromoPlantCapacities = (config: Config): PromoPlantCapacities => {
  const iconCapacities: Record<string, number> = {};
  let plantInstanceCapacity = 0;
  PROMO_BED_SIZES.map(({ length, width }) => {
    const plants = getCachedPlants({
      ...config,
      bedLengthOuter: length,
      bedWidthOuter: width,
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
  const handleThreeDLoadComplete = React.useCallback(() =>
    setThreeDLoaded(true), []);
  const common = {
    config, setConfig,
    toolTip, setToolTip,
    activeFocus, setActiveFocus,
  };

  const mapPoints = React.useMemo<TaggedGenericPointer[]>(() =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    calculatePointPositions(config), [
    config.soilSurface, config.soilHeight, config.soilSurfacePointCount,
    config.soilSurfaceVariance, config.bedXOffset, config.bedYOffset,
    config.bedWallThickness, config.bedLengthOuter, config.bedWidthOuter,
  ]);

  const startTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!config.animateSeasons) { return; }
    const currentSeasonTimings = getSeasonTimings(config.plants);
    const timeout = setTimeout(() => {
      startTimeRef.current = performance.now() / 1000;
      setConfig(prevConfig => {
        const nextSeasonTimings = getSeasonTimings(prevConfig.plants, 1);
        return {
          ...prevConfig,
          plants: nextSeasonTimings.season,
        };
      });
    }, (currentSeasonTimings.duration + currentSeasonTimings.pause) * 1000);
    return () => clearTimeout(timeout);
  }, [config.plants, config.animateSeasons]);

  React.useEffect(() => {
    startTimeRef.current = performance.now() / 1000;
  }, []);

  React.useEffect(() => {
    if (!activeFocus) { return; }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key != "Escape") { return; }
      setActiveFocus("");
      setUrlParam("focus", "");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFocus]);

  const plants = React.useMemo(() => {
    return getCachedPlants(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.plants, config.bedLengthOuter, config.bedWidthOuter]);

  const threeDPlants = React.useMemo(() => {
    return config.promoSpread
      ? plants.map(plant => ({ ...plant, id: 0 }))
      : plants;
  }, [plants, config.promoSpread]);
  const plantCapacityConfig = React.useMemo(() => ({
    ...INITIAL,
    plants: config.plants,
  }), [config.plants]);
  const plantCapacities = React.useMemo(() =>
    getPromoPlantCapacities(plantCapacityConfig), [plantCapacityConfig]);

  return <div className={"three-d-garden promo"}>
    <div className={"garden-bed-3d-model"}>
      <FocusTransitionProvider enabled={config.animate}>
        <MemoryRouter>
          <Canvas
            shadows={"variance"}
            onCreated={({ gl }) => {
              gl.localClippingEnabled = true;
            }}>
            <GardenModel {...common}
              configPosition={{ x: config.x, y: config.y, z: config.z }}
              startTimeRef={startTimeRef}
              threeDPlants={threeDPlants}
              mapPoints={mapPoints}
              plantIconCapacities={plantCapacities.iconCapacities}
              plantInstanceCapacity={plantCapacities.plantInstanceCapacity}
              onLoadComplete={handleThreeDLoadComplete}
              smoothFocusTransitions={true} />
          </Canvas>
        </MemoryRouter>
        <PublicOverlay {...common}
          loadComplete={threeDLoaded}
          startTimeRef={startTimeRef} />
        {!config.config &&
        <img className={"gear"} src={ASSETS.other.gear} title={"config"}
          onClick={() => setConfig({ ...config, config: true })} />}
        {config.config &&
        <PrivateOverlay {...common} startTimeRef={startTimeRef} />}
        <span className={"tool-tip"} hidden={!toolTip.text}>
          {toolTip.text}
        </span>
      </FocusTransitionProvider>
    </div>
  </div>;
};
