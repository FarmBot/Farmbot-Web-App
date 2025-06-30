import React from "react";
import { Config, getSeasonProperties, INITIAL } from "../config";
import {
  Vector3, PointLight as ThreePointLight, Mesh,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  Color,
  Material,
} from "three";
import {
  BufferAttribute, BufferGeometry, Group, MeshBasicMaterial, PointLight,
  Points, PointsMaterial,
} from "../components";
import { Billboard, Line, Sphere, Text3D, Trail } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import SunCalc from "suncalc";
import { range } from "lodash";
import moment from "moment";
import { SEASON_DURATIONS } from "../../promo/constants";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { ASSETS, BigDistance } from "../constants";

const sunDecay = 0;
const shadowNormalBias = 100;
const SUN_COLOR = ["#FFD700", "#FFEA00", "#FFF700", "#FFE066"];

export const getCycleLength = (season: string) =>
  SEASON_DURATIONS[season] || 20;

export interface SunProps {
  config: Config;
  startTimeRef?: React.RefObject<number>;
  skyRef: React.RefObject<ThreeMeshBasicMaterial | null>;
}

const offset = 50;
const SUN_OFFSETS: [number, number][] = [
  [0, 0],
  [0, offset],
  [offset, offset],
  [offset, 0],
];

const offsetSunPos =
  (sunPos: Vector3, index: number): [number, number, number] => {
    const offset = SUN_OFFSETS[index];
    return [sunPos.x + offset[0], sunPos.y + offset[1], sunPos.z];
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

  const sunParams = getSeasonProperties(config, "Spring");
  const { sunIntensity, sunColor } = sunParams;

  const sunPos = sunPosition(
    config.sunInclination,
    config.sunAzimuth,
    BigDistance.sunActual);

  const lightRefs = React.useRef<(ThreePointLight | null)[]>([]);
  const sphereRefs = React.useRef<(Mesh | null)[]>([]);
  // eslint-disable-next-line no-null/no-null
  const sunRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const sunFlatRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const lineRef = React.useRef<Line2>(null);
  const [points, setPoints] = React.useState<Vector3[]>(
    range(4).map(index => new Vector3(...offsetSunPos(sunPos, index))),
  );
  const sunFactor = React.useRef<number>(1);
  // eslint-disable-next-line no-null/no-null
  const starsRef = React.useRef<Material>(null);
  const origin = new Vector3(0, 0, 0);

  const setSunSky = (inclination: number, sunValue: number) => {
    sunFactor.current = calcSunI(inclination);
    props.skyRef.current?.color?.setRGB(...skyColor(sunFactor.current * sunValue));
    starsRef.current && (starsRef.current.opacity = (1 - sunFactor.current));
  };

  React.useEffect(() => {
    setSunSky(config.sunInclination, config.sun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.sunInclination, config.sun]);


  useFrame(() => {
    if (!config.animateSeasons || !props.startTimeRef) { return; }

    const totalCycle = getCycleLength(config.plants);
    const currentTime = performance.now() / 1000;
    const t = currentTime - props.startTimeRef.current;
    const timeOffset = Math.min(t / totalCycle, 1) * 24 * 60 * 60;
    const date = moment().utc().startOf("day").add(timeOffset, "seconds").toDate();
    const { azimuth, inclination } = calcSunCoordinate(date, 0, 52, 0);
    const position = (index: number) => {
      const sunPos = sunPosition(inclination, azimuth, BigDistance.sunActual);
      return offsetSunPos(sunPos, index);
    };

    setSunSky(inclination, config.sun);

    lightRefs.current.forEach((light, index) => {
      if (light) {
        light.position?.set(...position(index));
        light.intensity = sunIntensity * config.sun / 100 * sunFactor.current;
      }
    });

    sphereRefs.current.forEach((sphere, index) => {
      if (sphere) {
        sphere.position.set(...position(index));
      }
    });

    const visualPos = sunPosition(inclination, azimuth, BigDistance.sunVisual);
    sunRef.current?.position?.set(visualPos.x, visualPos.y, visualPos.z);
    const flatPos = sunPosition(0, azimuth, BigDistance.ground);
    sunFlatRef.current?.position?.set(flatPos.x, flatPos.y, flatPos.z);

    if (lineRef.current) {
      // eslint-disable-next-line @react-three/no-new-in-loop
      const newPoints = range(4).map(index => new Vector3(...position(index)));
      setPoints(newPoints);
    }
  });

  return <Group name={"sun"}>
    {range(4).map(index => {
      const position = offsetSunPos(sunPos, index);
      const color = SUN_COLOR[index];
      const intensity = sunIntensity * config.sun / 100 * sunFactor.current;
      return <Group key={index} name={`sun_${index}`}>
        <PointLight
          ref={(el: ThreePointLight) => {
            if (el) { lightRefs.current[index] = el; }
          }}
          intensity={intensity}
          color={sunColor}
          distance={BigDistance.sunAffect}
          decay={sunDecay}
          castShadow={true}
          shadow-normalBias={shadowNormalBias} // warning: distorts shadows
          position={position}
        />
        {config.lightsDebug &&
          <Line ref={lineRef} points={[points[index], origin]} color={color} />}
        {config.lightsDebug &&
          <Trail width={1000} color={"yellow"} length={100} attenuation={t => t}>
            <Sphere
              ref={el => { if (el) { sphereRefs.current[index] = el; } }}
              args={[500, 16, 16]}
              position={position}>
              <MeshBasicMaterial color={color} />
            </Sphere>
          </Trail>}
      </Group>;
    })}
    <Sphere
      ref={sunRef}
      args={[1000, 32, 32]}
      position={sunPosition(
        config.sunInclination,
        config.sunAzimuth,
        BigDistance.sunVisual)}>
      <MeshBasicMaterial color={SUN_COLOR[0]} />
    </Sphere>
    <OtherSuns starsRef={starsRef} />
    {config.lightsDebug && <SkyGrid config={config} />}
    {config.lightsDebug && <Sphere
      ref={sunFlatRef}
      args={[500, 8, 8]}
      position={sunPosition(0, config.sunAzimuth, BigDistance.ground)}>
      <MeshBasicMaterial color={SUN_COLOR[0]} />
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
        count={positions.length / 3}
        array={positions}
        itemSize={3} />
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
