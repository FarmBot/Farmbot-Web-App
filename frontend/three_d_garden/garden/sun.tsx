import React from "react";
import {
  Config, getSeasonProperties, INITIAL, seasonSpringConfig,
} from "../config";
import {
  Vector3, DirectionalLight as ThreeDirectionalLight, Mesh as ThreeMesh,
  Color,
} from "three";
import {
  DirectionalLight, Group, MeshBasicMaterial,
} from "../components";
import {
  Billboard, Line, Sphere, Text3D, Trail,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import SunCalc from "suncalc";
import { range } from "lodash";
import moment from "moment";
import { Season, SEASON_DURATIONS } from "../../promo/constants";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { ASSETS, BigDistance } from "../constants";
import { SECTION_CLIPPING_EXEMPT } from "../section";
import {
  Constellations, ConstellationsHandle,
} from "./constellations";
import { polarToCartesian } from "./celestial_coordinates";
import { TaggedSceneObject } from "farmbot";

const shadowBias = -0.0005;
const shadowRadius = 8;
const shadowBlurSamples = 8;
const shadowBuffer = 1000;
const SUN_COLOR = "#FFD700";
const DAY_SECONDS = 24 * 60 * 60;
const SUN_TIME_STEP_SECONDS = 60;
const BELOW_HORIZON_SUN_SPEED = 10;
const BELOW_HORIZON_SPEED_INCLINATION = -10;
export const isSkyFullyBlack = (
  sunFactor: number,
  sunValue: number,
): boolean => sunFactor * sunValue <= 0;
const sunAnimationCache: Record<string, SunAnimationSample[]> = {};
const SEASON_SUN_DATES: Record<string, [number, number]> = {
  [Season.Spring]: [2, 20],
  [Season.Summer]: [5, 21],
  [Season.Fall]: [8, 22],
  [Season.Winter]: [11, 21],
};

export const getCycleLength = (season: string) =>
  SEASON_DURATIONS[season] || 20;

export const getSeasonAnimationElapsed = (
  animateSeasons: boolean,
  startTimeRef?: React.RefObject<number>,
) => {
  const startedAt = startTimeRef?.current;
  if (startedAt == undefined) { return undefined; }
  if (startedAt < 0) {
    return -startedAt;
  }
  return animateSeasons
    ? performance.now() / 1000 - startedAt
    : undefined;
};

interface SunAnimationSample {
  animationSeconds: number;
  sunSeconds: number;
}

export interface SunProps {
  config: Config;
  cameraSideClipEnabled: boolean;
  constellationDiscoveryEnabled: boolean;
  showSun: boolean;
  sceneObjects: TaggedSceneObject[];
  startTimeRef?: React.RefObject<number>;
  backgroundColor: Color;
  onSunSetChange?(sunIsSet: boolean): void;
  onConstellationFound?(cropSlug: string): void;
}

export const sceneObjectShadowBounds = (
  sceneObjects: TaggedSceneObject[],
) => sceneObjects.reduce((bounds, sceneObject) => {
  if (!sceneObject.body.show) { return bounds; }
  const body = sceneObject.body;
  const xExtent = Math.abs(body.x_center) + 1000;
  const yExtent = Math.abs(body.y_center) + 1000;
  return Math.max(bounds, xExtent, yExtent);
}, 0);

export const refreshDirectionalLightShadow = (
  light: ThreeDirectionalLight | null,
) => {
  if (!light) { return; }
  light.shadow.camera.updateProjectionMatrix();
  light.shadow.needsUpdate = true;
};

export const calcSunCoordinate = (
  date: Date,
  heading: number,
  latitude: number,
  longitude: number,
) => {
  const sunPosition = SunCalc.getPosition(date, latitude, longitude);
  const sunAzimuth = sunPosition.azimuth * (180 / Math.PI);
  return {
    azimuth: (sunAzimuth - heading - 90 + 360) % 360,
    inclination: sunPosition.altitude * (180 / Math.PI),
  };
};

export const getAnimatedSeasonDate = (
  season: string,
  elapsedSeconds: number,
  dayStart?: Date,
) => {
  const totalCycle = getCycleLength(season);
  const clampedElapsed = Math.min(Math.max(elapsedSeconds, 0), totalCycle);
  const seasonDayStart = getSeasonDayStart(season, dayStart);
  const samples = getSunAnimationSamples(seasonDayStart);
  const totalAnimationSeconds = samples[samples.length - 1].animationSeconds;
  const targetAnimationSeconds =
    clampedElapsed / totalCycle * totalAnimationSeconds;
  const sample = findSunAnimationSample(samples, targetAnimationSeconds);
  const date = new Date(seasonDayStart.getTime() + sample.sunSeconds * 1000);
  return date;
};

export const getAnimatedSeasonSunCoordinate = (
  season: string,
  elapsedSeconds: number,
) => calcSunCoordinate(
  getAnimatedSeasonDate(season, elapsedSeconds),
  0,
  35,
  0,
);

const findSunAnimationSample = (
  samples: SunAnimationSample[],
  targetAnimationSeconds: number,
) => {
  let low = 0;
  let high = samples.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (samples[mid].animationSeconds >= targetAnimationSeconds) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return samples[low];
};

const getSeasonDayStart = (season: string, dayStart?: Date) => {
  const seasonDate = SEASON_SUN_DATES[season];
  if (!seasonDate) {
    return dayStart ?? moment().utc().startOf("day").toDate();
  }
  const [month, day] = seasonDate;
  return new Date(Date.UTC(2016, month, day));
};

const getSunAnimationSamples = (dayStart: Date): SunAnimationSample[] => {
  const cacheKey = dayStart.toISOString().slice(0, 10);
  const cachedSamples = sunAnimationCache[cacheKey];
  if (cachedSamples) { return cachedSamples; }
  const samples: SunAnimationSample[] = [];
  let animationSeconds = 0;
  for (let sunSeconds = 0; sunSeconds <= DAY_SECONDS;
    sunSeconds += SUN_TIME_STEP_SECONDS) {
    samples.push({ animationSeconds, sunSeconds });
    const date = new Date(dayStart.getTime() + sunSeconds * 1000);
    const { inclination } = calcSunCoordinate(date, 0, 35, 0);
    const speed = inclination < BELOW_HORIZON_SPEED_INCLINATION
      ? BELOW_HORIZON_SUN_SPEED
      : 1;
    animationSeconds += SUN_TIME_STEP_SECONDS / speed;
  }
  sunAnimationCache[cacheKey] = samples;
  return samples;
};

export const sunPosition = (
  sunInclination: number,
  sunAzimuth: number,
  distance: number,
): Vector3 => {
  const theta = 90 - sunAzimuth;
  const phi = 90 - sunInclination;
  const position = polarToCartesian(distance, theta, phi);
  return new Vector3(...position);
};

export const nearestEquivalentAngle = (
  current: number,
  target: number,
) => target + 360 * Math.round((current - target) / 360);

export const getSeasonAnimationElapsedAtSunPosition = (
  season: string,
  inclination: number,
  azimuth: number,
) => {
  const dayStart = getSeasonDayStart(season);
  const samples = getSunAnimationSamples(dayStart);
  const target = sunPosition(inclination, azimuth, 1);
  let closestSample = samples[0];
  let closestDistance = Infinity;
  samples.map(sample => {
    const date = new Date(dayStart.getTime() + sample.sunSeconds * 1000);
    const coordinate = calcSunCoordinate(date, 0, 35, 0);
    const distance = sunPosition(
      coordinate.inclination,
      coordinate.azimuth,
      1,
    ).distanceToSquared(target);
    if (distance < closestDistance) {
      closestSample = sample;
      closestDistance = distance;
    }
  });
  const totalAnimationSeconds =
    samples[samples.length - 1].animationSeconds;
  return closestSample.animationSeconds / totalAnimationSeconds
    * getCycleLength(season);
};

const convertColor =
  (r: number, g: number, b: number): [number, number, number] => {
    const color = new Color(r / 255, g / 255, b / 255);
    color.convertSRGBToLinear();
    return [color.r, color.g, color.b];
  };

const BLACK_SKY_COLOR = convertColor(0, 0, 0);
const DEFAULT_DAY_SKY_COLOR_VAL: [number, number, number] = [89, 216, 255];
const MARS_DAY_SKY_COLOR_VAL: [number, number, number] = [184, 87, 56];
const DAY_SKY_COLOR_VAL = (scene: string): [number, number, number] => {
  return scene == "Mars"
    ? MARS_DAY_SKY_COLOR_VAL
    : DEFAULT_DAY_SKY_COLOR_VAL;
};
const DEFAULT_DAY_SKY_COLOR = convertColor(...DEFAULT_DAY_SKY_COLOR_VAL);
const MARS_DAY_SKY_COLOR = convertColor(...MARS_DAY_SKY_COLOR_VAL);
const DAY_SKY_COLOR = (scene: string) => scene == "Mars"
  ? MARS_DAY_SKY_COLOR
  : DEFAULT_DAY_SKY_COLOR;

export const skyColor = (
  sunValue: number,
  scene: string,
): [number, number, number] => {
  if (sunValue <= 0) {
    return BLACK_SKY_COLOR;
  }
  if (sunValue >= INITIAL.sun) {
    return DAY_SKY_COLOR(scene);
  }
  const v = DAY_SKY_COLOR_VAL(scene);
  const t = sunValue / INITIAL.sun;
  const r = Math.round(v[0] * t);
  const g = Math.round(v[1] * t);
  const b = Math.round(v[2] * t);
  return convertColor(r, g, b);
};

export const calcSunI = (inclination: number) => {
  const fadeStart = -10;
  const fadeEnd = 10;
  if (inclination < fadeStart) {
    return 0;
  }
  if (inclination < fadeEnd) {
    const fadeT = (inclination - fadeStart) / (fadeEnd - fadeStart);
    return fadeT;
  }
  if (inclination > 180 - fadeStart) {
    return 0;
  }
  if (inclination > 180 - fadeEnd) {
    const fadeT = (180 - inclination - fadeStart) / (fadeEnd - fadeStart);
    return fadeT;
  }
  return 1;
};

interface AnimatedSunFrameProps extends SunProps {
  lightRef: React.RefObject<ThreeDirectionalLight | null>;
  debugSunRef: React.RefObject<ThreeMesh | null>;
  sunRef: React.RefObject<ThreeMesh | null>;
  sunFlatRef: React.RefObject<ThreeMesh | null>;
  lineRef: React.RefObject<Line2 | null>;
  animatedSunRef: React.MutableRefObject<SunSpringValues>;
  sunIntensity: number;
  setPoint: React.Dispatch<React.SetStateAction<Vector3>>;
  setSunSky(
    sunFactor: number,
    sunValue: number,
  ): void;
}

interface SunSpringValues {
  color: string;
  intensity: number;
  inclination: number;
  azimuth: number;
}

export const AnimatedSunFrame = (props: AnimatedSunFrameProps) => {
  const {
    config, startTimeRef, lightRef, debugSunRef, sunRef, sunFlatRef, lineRef,
    animatedSunRef, sunIntensity, setPoint, setSunSky,
  } = props;
  const updateSunPosition = () => {
    const t = getSeasonAnimationElapsed(config.animateSeasons, startTimeRef);
    if (t == undefined) { return; }

    const { azimuth, inclination } =
      getAnimatedSeasonSunCoordinate(config.plants, t);
    animatedSunRef.current = {
      ...animatedSunRef.current,
      azimuth,
      inclination,
    };
    const sunFactor = calcSunI(inclination);
    const position = sunPosition(inclination, azimuth, BigDistance.sunActual);

    setSunSky(sunFactor, config.sun);

    const light = lightRef.current;
    if (light) {
      light.position?.set(position.x, position.y, position.z);
      light.intensity = sunIntensity * config.sun / 100 * sunFactor;
    }

    debugSunRef.current?.position.set(position.x, position.y, position.z);

    const visualPos = sunPosition(inclination, azimuth, BigDistance.sunVisual);
    sunRef.current?.position?.set(visualPos.x, visualPos.y, visualPos.z);
    const flatPos = sunPosition(0, azimuth, BigDistance.ground);
    sunFlatRef.current?.position?.set(flatPos.x, flatPos.y, flatPos.z);

    if (lineRef.current) {
      setPoint(position);
    }
  };

  React.useLayoutEffect(updateSunPosition);
  useFrame(updateSunPosition);

  return undefined;
};

const SunBase = (props: SunProps) => {
  const { config } = props;

  const sunParams = getSeasonProperties(config, "Summer");
  const { sunIntensity, sunColor, sunInclination: seasonSunInclination } =
    sunParams;
  const targetSunInclination = config.sunInclination == INITIAL.sunInclination
    ? seasonSunInclination
    : config.sunInclination;
  const targetSunAzimuth = config.sunAzimuth;
  const [initialSunColor] = React.useState(sunColor);
  const [renderedSunIntensity, setRenderedSunIntensity] =
    React.useState(sunIntensity);
  const [renderedSunInclination, setRenderedSunInclination] =
    React.useState(targetSunInclination);
  const [renderedSunAzimuth, setRenderedSunAzimuth] =
    React.useState(targetSunAzimuth);
  const renderedSunAzimuthRef = React.useRef(targetSunAzimuth);

  const sunPos = sunPosition(
    renderedSunInclination,
    renderedSunAzimuth,
    BigDistance.sunActual);

  // eslint-disable-next-line no-null/no-null
  const lightRef = React.useRef<ThreeDirectionalLight>(null);
  // eslint-disable-next-line no-null/no-null
  const debugSunRef = React.useRef<ThreeMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const sunRef = React.useRef<ThreeMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const sunFlatRef = React.useRef<ThreeMesh>(null);
  // eslint-disable-next-line no-null/no-null
  const lineRef = React.useRef<Line2>(null);
  const [point, setPoint] = React.useState<Vector3>(sunPos);
  // eslint-disable-next-line no-null/no-null
  const constellationsRef = React.useRef<ConstellationsHandle>(null);
  const origin = new Vector3(0, 0, 0);
  const renderedSunFactor = calcSunI(renderedSunInclination);
  const showStarField =
    renderedSunFactor < 1 || !!props.startTimeRef;
  const sunIsSetRef = React.useRef<boolean | undefined>(undefined);
  const shadowBounds = React.useMemo(() => {
    const bedXBounds = Math.max(
      Math.abs(config.bedXOffset),
      Math.abs(config.bedLengthOuter - config.bedXOffset),
    );
    const bedYBounds = Math.max(
      Math.abs(config.bedYOffset),
      Math.abs(config.bedWidthOuter - config.bedYOffset),
    );
    const bedBounds = Math.max(bedXBounds, bedYBounds) + shadowBuffer;
    const sceneObjectBounds = sceneObjectShadowBounds(props.sceneObjects)
      + shadowBuffer;
    return Math.max(
      bedBounds,
      sceneObjectBounds,
      config.botSizeX,
      config.botSizeY,
    );
  }, [
    config.bedXOffset,
    config.bedLengthOuter,
    config.bedYOffset,
    config.bedWidthOuter,
    config.botSizeX,
    config.botSizeY,
    props.sceneObjects,
  ]);
  React.useLayoutEffect(() => {
    refreshDirectionalLightShadow(lightRef.current);
  }, [shadowBounds]);

  const setSunSky = (
    sunFactor: number,
    sunValue: number,
  ) => {
    const skySunValue = sunFactor * sunValue;
    props.backgroundColor.setRGB(
      ...skyColor(skySunValue, config.scene),
    );
    constellationsRef.current?.setNightFactor(1 - sunFactor);
    const nextSunIsSet = isSkyFullyBlack(sunFactor, sunValue);
    if (sunIsSetRef.current != nextSunIsSet) {
      sunIsSetRef.current = nextSunIsSet;
      props.onSunSetChange?.(nextSunIsSet);
    }
  };

  const sunSpringTargets = React.useMemo(() => ({
    color: sunColor,
    intensity: sunIntensity,
    inclination: targetSunInclination,
    azimuth: targetSunAzimuth,
  }), [sunColor, sunIntensity, targetSunAzimuth, targetSunInclination]);
  const animatedSunRef = React.useRef<SunSpringValues>(sunSpringTargets);
  const lastSeasonAnimationActive = React.useRef(false);
  const setSunSpringValues = React.useCallback((
    value: Partial<SunSpringValues>,
  ) => {
    value.color && lightRef.current?.color?.set(value.color);
    typeof value.intensity == "number" &&
      setRenderedSunIntensity(value.intensity);
    typeof value.inclination == "number" &&
      setRenderedSunInclination(value.inclination);
    if (typeof value.azimuth == "number") {
      renderedSunAzimuthRef.current = value.azimuth;
      setRenderedSunAzimuth(value.azimuth);
    }
  }, []);
  const [, sunSpringApi] = useSpring(() => sunSpringTargets);

  React.useLayoutEffect(() => {
    const seasonAnimationActive =
      getSeasonAnimationElapsed(config.animateSeasons, props.startTimeRef)
      != undefined;
    const fromAnimatedSun =
      lastSeasonAnimationActive.current && !seasonAnimationActive
        ? animatedSunRef.current
        : undefined;
    lastSeasonAnimationActive.current = seasonAnimationActive;
    fromAnimatedSun && setSunSpringValues(fromAnimatedSun);
    const continuousSunSpringTargets = {
      ...sunSpringTargets,
      azimuth: nearestEquivalentAngle(
        fromAnimatedSun?.azimuth ?? renderedSunAzimuthRef.current,
        targetSunAzimuth,
      ),
    };
    sunSpringApi.start({
      from: fromAnimatedSun,
      to: continuousSunSpringTargets,
      immediate: !config.animate,
      onChange: result => {
        const value = result.value as Partial<SunSpringValues>;
        setSunSpringValues(value);
      },
      onRest: () => setSunSpringValues(continuousSunSpringTargets),
      config: seasonSpringConfig,
    });
  }, [
    config.animate,
    config.animateSeasons,
    props.startTimeRef,
    setSunSpringValues,
    sunColor,
    sunIntensity,
    sunSpringApi,
    sunSpringTargets,
    targetSunAzimuth,
    targetSunInclination,
  ]);

  React.useEffect(() => {
    if (getSeasonAnimationElapsed(config.animateSeasons, props.startTimeRef)
      != undefined) {
      return;
    }
    setSunSky(renderedSunFactor, config.sun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.animateSeasons,
    config.sun,
    props.startTimeRef,
    renderedSunFactor,
    renderedSunInclination,
  ]);

  return <Group name={"sun"}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
    {props.startTimeRef &&
      <AnimatedSunFrame
        {...props}
        lightRef={lightRef}
        debugSunRef={debugSunRef}
        sunRef={sunRef}
        sunFlatRef={sunFlatRef}
        lineRef={lineRef}
        animatedSunRef={animatedSunRef}
        sunIntensity={renderedSunIntensity}
        setPoint={setPoint}
        setSunSky={setSunSky} />}
    <Group name={"sun-visuals"} visible={props.showSun}>
      <DirectionalLight
        ref={lightRef}
        intensity={renderedSunIntensity * config.sun / 100 * renderedSunFactor}
        color={initialSunColor}
        castShadow={!config.lowDetail}
        shadow-bias={shadowBias}
        shadow-radius={shadowRadius}
        shadow-blurSamples={shadowBlurSamples}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={BigDistance.sunAffect}
        shadow-camera-left={-shadowBounds}
        shadow-camera-right={shadowBounds}
        shadow-camera-top={shadowBounds}
        shadow-camera-bottom={-shadowBounds}
        position={sunPos}
      />
      {config.lightsDebug &&
        <Line ref={lineRef} points={[point, origin]} color={SUN_COLOR} />}
      {config.lightsDebug &&
        <Trail width={1000} color={"yellow"} length={100} attenuation={t => t}>
          <Sphere
            ref={debugSunRef}
            args={[500, 16, 16]}
            position={sunPos}>
            <MeshBasicMaterial color={SUN_COLOR} />
          </Sphere>
        </Trail>}
      <Sphere
        name={"sun-visual"}
        ref={sunRef}
        args={[1000, 32, 32]}
        position={sunPosition(
          renderedSunInclination,
          renderedSunAzimuth,
          BigDistance.sunVisual)}>
        <MeshBasicMaterial color={SUN_COLOR} />
      </Sphere>
      {config.lightsDebug && <SkyGrid config={config} />}
      {config.lightsDebug && <Sphere
        ref={sunFlatRef}
        args={[500, 8, 8]}
        position={sunPosition(0, renderedSunAzimuth, BigDistance.ground)}>
        <MeshBasicMaterial color={SUN_COLOR} />
      </Sphere>}
    </Group>
    {showStarField &&
      <React.Suspense fallback={undefined}>
        <Constellations
          ref={constellationsRef}
          enabled={config.constellations
            || props.constellationDiscoveryEnabled}
          debug={config.constellationsDebug}
          cameraSideClipEnabled={props.cameraSideClipEnabled}
          discoveryEnabled={props.constellationDiscoveryEnabled}
          onConstellationFound={props.onConstellationFound}
          nightFactor={1 - renderedSunFactor} />
      </React.Suspense>}
  </Group>;
};

const SUN_CONFIG_FIELDS: (keyof Config)[] = [
  "animateSeasons",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeX",
  "botSizeY",
  "constellations",
  "constellationsDebug",
  "lightsDebug",
  "lowDetail",
  "plants",
  "sun",
  "sunAzimuth",
  "sunInclination",
];

export const sunPropsEqual = (prev: SunProps, next: SunProps) =>
  prev.backgroundColor === next.backgroundColor
  && prev.sceneObjects === next.sceneObjects
  && prev.cameraSideClipEnabled === next.cameraSideClipEnabled
  && prev.constellationDiscoveryEnabled
  === next.constellationDiscoveryEnabled
  && prev.showSun === next.showSun
  && prev.startTimeRef === next.startTimeRef
  && prev.onSunSetChange === next.onSunSetChange
  && prev.onConstellationFound === next.onConstellationFound
  && SUN_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Sun = React.memo(SunBase, sunPropsEqual);

interface SkyGridProps {
  config: Config;
}

const SkyGrid = (props: SkyGridProps) => {
  const radius = BigDistance.ground;
  return <Group name={"sky-grid"}>
    {range(0, 360, 15).map((angle, index) => {
      const newAngle = (angle + props.config.heading) % 360;
      const [x, y, z] = polarToCartesian(radius, newAngle, 90);
      return <Group key={index} name={`sky-grid-line-${angle}`}>
        <Line
          points={[[x, y, z - 10000], [x, y, z + 10000]]}
          lineWidth={5}
          color={"gray"} />
        <Billboard
          position={[x, y, z]}>
          <Text3D font={ASSETS.fonts.cabinBold} size={1000} height={1}>
            {`${360 - angle}°`}
            <MeshBasicMaterial color={"white"} />
          </Text3D>
        </Billboard>
      </Group>;
    })}
  </Group>;
};
