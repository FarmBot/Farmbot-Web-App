import React from "react";
import { Config, getSeasonProperties, INITIAL } from "../config";
import {
  Vector3, DirectionalLight as ThreeDirectionalLight, Mesh,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  Color,
  Material,
} from "three";
import {
  BufferAttribute, BufferGeometry, DirectionalLight, Group, MeshBasicMaterial,
  Points, PointsMaterial,
} from "../components";
import { Billboard, Line, Sphere, Text3D, Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import SunCalc from "suncalc";
import { range } from "lodash";
import moment from "moment";
import { Season, SEASON_DURATIONS } from "../../promo/constants";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { ASSETS, BigDistance } from "../constants";

const shadowBias = -0.0005;
const shadowRadius = 8;
const shadowBlurSamples = 8;
const shadowBuffer = 1000;
const SUN_COLOR = "#FFD700";
const DAY_SECONDS = 24 * 60 * 60;
const SUN_TIME_STEP_SECONDS = 60;
const BELOW_HORIZON_SUN_SPEED = 10;
const BELOW_HORIZON_SPEED_INCLINATION = -10;
const sunAnimationCache: Record<string, SunAnimationSample[]> = {};
const SEASON_SUN_DATES: Record<string, [number, number]> = {
  [Season.Spring]: [2, 20],
  [Season.Summer]: [5, 21],
  [Season.Fall]: [8, 22],
  [Season.Winter]: [11, 21],
};

export const getCycleLength = (season: string) =>
  SEASON_DURATIONS[season] || 20;

interface SunAnimationSample {
  animationSeconds: number;
  sunSeconds: number;
}

export interface SunProps {
  config: Config;
  startTimeRef?: React.RefObject<number>;
  skyRef: React.RefObject<ThreeMeshBasicMaterial | null>;
}

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
  dayStart = moment().utc().startOf("day").toDate(),
) => {
  const totalCycle = getCycleLength(season);
  const clampedElapsed = Math.min(Math.max(elapsedSeconds, 0), totalCycle);
  const seasonDayStart = getSeasonDayStart(season, dayStart);
  const samples = getSunAnimationSamples(seasonDayStart);
  const totalAnimationSeconds = samples[samples.length - 1].animationSeconds;
  const targetAnimationSeconds =
    clampedElapsed / totalCycle * totalAnimationSeconds;
  const sample = samples.find(({ animationSeconds }) =>
    animationSeconds >= targetAnimationSeconds) || samples[samples.length - 1];
  const date = new Date(seasonDayStart.getTime() + sample.sunSeconds * 1000);
  return date;
};

const getSeasonDayStart = (season: string, dayStart: Date) => {
  const seasonDate = SEASON_SUN_DATES[season];
  if (!seasonDate) { return dayStart; }
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

const toRad = (degrees: number) => degrees * Math.PI / 180;
const polarToCartesian = (
  radius: number,
  thetaDegrees: number,
  phiDegrees: number,
): [number, number, number] => {
  const theta = toRad(thetaDegrees);
  const phi = toRad(phiDegrees);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return [x, y, z];
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

const convertColor =
  (r: number, g: number, b: number): [number, number, number] => {
    const color = new Color(r / 255, g / 255, b / 255);
    color.convertSRGBToLinear();
    return [color.r, color.g, color.b];
  };

export const skyColor = (sunValue: number): [number, number, number] => {
  if (sunValue <= 0) {
    return convertColor(0, 0, 0);
  }
  if (sunValue >= INITIAL.sun) {
    return convertColor(89, 216, 255);
  }
  const t = sunValue / INITIAL.sun;
  const r = Math.round(89 * t);
  const g = Math.round(216 * t);
  const b = Math.round(255 * t);
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

export const Sun = (props: SunProps) => {
  const { config } = props;

  const sunParams = getSeasonProperties(config, "Summer");
  const { sunIntensity, sunColor } = sunParams;

  const sunPos = sunPosition(
    config.sunInclination,
    config.sunAzimuth,
    BigDistance.sunActual);

  // eslint-disable-next-line no-null/no-null
  const lightRef = React.useRef<ThreeDirectionalLight>(null);
  // eslint-disable-next-line no-null/no-null
  const debugSunRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const sunRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const sunFlatRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const lineRef = React.useRef<Line2>(null);
  const [point, setPoint] = React.useState<Vector3>(sunPos);
  // eslint-disable-next-line no-null/no-null
  const starsRef = React.useRef<Material>(null);
  const origin = new Vector3(0, 0, 0);
  const renderedSunFactor = calcSunI(config.sunInclination);
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
    return Math.max(bedBounds, config.botSizeX, config.botSizeY);
  }, [
    config.bedXOffset,
    config.bedLengthOuter,
    config.bedYOffset,
    config.bedWidthOuter,
    config.botSizeX,
    config.botSizeY,
  ]);

  const setSunSky = (sunFactor: number, sunValue: number) => {
    props.skyRef.current?.color?.setRGB(
      ...skyColor(sunFactor * sunValue),
    );
    starsRef.current &&
      (starsRef.current.opacity = (1 - sunFactor));
  };

  React.useEffect(() => {
    setSunSky(renderedSunFactor, config.sun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sunInclination, config.sun]);


  useFrame(() => {
    if (!config.animateSeasons || !props.startTimeRef) { return; }

    const currentTime = performance.now() / 1000;
    const t = currentTime - props.startTimeRef.current;
    const date = getAnimatedSeasonDate(config.plants, t);
    const { azimuth, inclination } = calcSunCoordinate(date, 0, 35, 0);
    const sunFactor = calcSunI(inclination);
    const position = sunPosition(inclination, azimuth, BigDistance.sunActual);

    setSunSky(sunFactor, config.sun);

    if (lightRef.current) {
      lightRef.current.position?.set(position.x, position.y, position.z);
      lightRef.current.intensity =
        sunIntensity * config.sun / 100 * sunFactor;
    }

    debugSunRef.current?.position.set(position.x, position.y, position.z);

    const visualPos = sunPosition(inclination, azimuth, BigDistance.sunVisual);
    sunRef.current?.position?.set(visualPos.x, visualPos.y, visualPos.z);
    const flatPos = sunPosition(0, azimuth, BigDistance.ground);
    sunFlatRef.current?.position?.set(flatPos.x, flatPos.y, flatPos.z);

    if (lineRef.current) {
      setPoint(position);
    }
  });

  return <Group name={"sun"}>
    <DirectionalLight
      ref={lightRef}
      intensity={sunIntensity * config.sun / 100 * renderedSunFactor}
      color={sunColor}
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
      ref={sunRef}
      args={[1000, 32, 32]}
      position={sunPosition(
        config.sunInclination,
        config.sunAzimuth,
        BigDistance.sunVisual)}>
      <MeshBasicMaterial color={SUN_COLOR} />
    </Sphere>
    <OtherSuns starsRef={starsRef} />
    {config.lightsDebug && <SkyGrid config={config} />}
    {config.lightsDebug && <Sphere
      ref={sunFlatRef}
      args={[500, 8, 8]}
      position={sunPosition(0, config.sunAzimuth, BigDistance.ground)}>
      <MeshBasicMaterial color={SUN_COLOR} />
    </Sphere>}
  </Group>;
};

const generateOtherSuns = () => {
  const points = [];
  const maxPhi = 80;
  const r = BigDistance.sunVisual;
  for (let i = 0; i < 1000; i++) {
    const theta = Math.random() * 360;
    const phi = Math.random() * maxPhi;
    const position = polarToCartesian(r, theta, phi);
    points.push(...position);
  }
  return new Float32Array(points);
};

const OtherSuns = ({ starsRef }: { starsRef: React.RefObject<Material | null> }) => {
  const positions = React.useMemo(() => generateOtherSuns(), []);
  return <Points>
    <BufferGeometry>
      <BufferAttribute
        attach={"attributes-position"}
        args={[positions, 3]} />
    </BufferGeometry>
    <PointsMaterial
      ref={starsRef}
      color={"white"}
      size={1}
      sizeAttenuation={false}
      transparent={true}
      opacity={1}
      depthWrite={false} />
  </Points>;
};

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
