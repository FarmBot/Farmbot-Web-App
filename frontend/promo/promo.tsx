import React from "react";
import {
  Config, INITIAL, modifyConfigsFromUrlParams,
  PRESETS,
} from "../three_d_garden/config";
import { GardenModel } from "../three_d_garden/garden_model";
import { Canvas } from "@react-three/fiber";
import {
  PrivateOverlay, PublicOverlay, ToolTip,
} from "../three_d_garden/config_overlays";
import { ASSETS } from "../three_d_garden/constants";
import { getFocusFromUrlParams } from "../three_d_garden/zoom_beacons_constants";
import { MemoryRouter } from "react-router";
import { calculatePlantPositions } from "./plants";
import { ThreeDGardenPlant } from "../three_d_garden/garden";
import { TaggedGenericPointer } from "farmbot";
import { calculatePointPositions } from "./points";
import { SEASON_TIMINGS, SEASONS } from "./constants";

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
  const positions = calculatePlantPositions(config);
  cache[cacheKey] = positions;
  return cache;
};

export const getSeasonTimings = (currentSeason: string, step = 0) => {
  const seasons = SEASON_TIMINGS.map(s => s.season);
  const seasonIndex = seasons.indexOf(currentSeason);
  const validSeasonIndex = seasonIndex >= 0 ? seasonIndex : 0;
  const selectedSeasonIndex = (validSeasonIndex + step) % seasons.length;
  const selectedSeasonTimings = SEASON_TIMINGS[selectedSeasonIndex];
  return selectedSeasonTimings;
};

export const Promo = () => {
  const [config, setConfig] = React.useState<Config>(INITIAL);
  const [toolTip, setToolTip] = React.useState<ToolTip>({ timeoutId: 0, text: "" });
  const [activeFocus, setActiveFocus] = React.useState("");
  const common = {
    config, setConfig,
    toolTip, setToolTip,
    activeFocus, setActiveFocus,
  };

  React.useEffect(() => {
    setConfig(modifyConfigsFromUrlParams(config));
    setActiveFocus(getFocusFromUrlParams());
    PROMO_BED_SIZES.map(({ length, width }) => {
      SEASONS.map(season => {
        const tmpConfig = {
          ...INITIAL,
          bedLengthOuter: length,
          bedWidthOuter: width,
          plants: season,
        };
        setPlantsCache(calcPlantsCache(plantsCache, tmpConfig));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty dependency array

  const [plantsCache, setPlantsCache] = React.useState<ThreeDPlantsCache>({});
  const [mapPoints, setMapPoints] = React.useState<TaggedGenericPointer[]>([]);

  React.useEffect(() => {
    setPlantsCache(calcPlantsCache(plantsCache, config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.plants, config.bedLengthOuter, config.bedWidthOuter]);

  React.useEffect(() => {
    setMapPoints(calculatePointPositions(config));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.soilSurface, config.soilHeight, config.soilSurfacePointCount,
    config.soilSurfaceVariance, config.bedXOffset, config.bedYOffset,
    config.bedWallThickness, config.bedLengthOuter, config.bedWidthOuter,
  ]);

  const startTimeRef = React.useRef<number>(performance.now() / 1000);

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

  return <div className={"three-d-garden promo"}>
    <div className={"garden-bed-3d-model"}>
      <MemoryRouter>
        <Canvas shadows={true}>
          <GardenModel {...common}
            startTimeRef={startTimeRef}
            threeDPlants={plantsCache[calcCacheKey(config)] || []}
            mapPoints={mapPoints} />
        </Canvas>
      </MemoryRouter>
      <PublicOverlay {...common} startTimeRef={startTimeRef} />
      {!config.config &&
        <img className={"gear"} src={ASSETS.other.gear} title={"config"}
          onClick={() => setConfig({ ...config, config: true })} />}
      {config.config &&
        <PrivateOverlay {...common} startTimeRef={startTimeRef} />}
      <span className={"tool-tip"} hidden={!toolTip.text}>
        {toolTip.text}
      </span>
    </div>
  </div>;
};
