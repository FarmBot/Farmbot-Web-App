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
import { SEASON_DURATIONS } from "../../promo/constants";
import { Line2 } from "three/examples/jsm/lines/Line2";
import { ASSETS, BigDistance } from "../constants";
import { threeSpace, zZero } from "../helpers";

const shadowBias = -0.0005;
const shadowNormalBias = 0;
const shadowRadius = 8;
const shadowBlurSamples = 8;
const shadowBuffer = 1000;
const SUN_COLOR = "#FFD700";

export const getCycleLength = (season: string) =>
  SEASON_DURATIONS[season] || 20;

export interface SunProps {
  config: Config;
  startTimeRef?: React.RefObject<number>;
  skyRef: React.RefObject<ThreeMeshBasicMaterial | null>;
  sunFactorRef?: React.MutableRefObject<number>;
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

export const Sun = React.memo((props: SunProps) => {
  const { config } = props;

  const sunParams = React.useMemo(
    () => getSeasonProperties(config, "Summer"),
    [config],
  );
  const { sunIntensity, sunColor } = sunParams;
  const sunIntensityBase = React.useMemo(
    () => sunIntensity * config.sun / 100,
    [config.sun, sunIntensity],
  );

  const sunPos = React.useMemo(() =>
    sunPosition(
      config.sunInclination,
      config.sunAzimuth,
      BigDistance.sunActual,
    ), [config.sunAzimuth, config.sunInclination]);
  const sunVisualPosition = React.useMemo(() =>
    sunPosition(
      config.sunInclination,
      config.sunAzimuth,
      BigDistance.sunVisual,
    ), [config.sunAzimuth, config.sunInclination]);
  const sunFlatPosition = React.useMemo(
    () => sunPosition(0, config.sunAzimuth, BigDistance.ground),
    [config.sunAzimuth],
  );

  const lightRef = React.useRef<ThreeDirectionalLight | null>(null);
  const sphereRef = React.useRef<Mesh | null>(null);
  // eslint-disable-next-line no-null/no-null
  const sunRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const sunFlatRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const lineRef = React.useRef<Line2>(null);
  const [points, setPoints] = React.useState<Vector3[]>(() =>
    [sunPos.clone()]);
  const pointsRef = React.useRef<Vector3[]>(points);
  React.useEffect(() => {
    const nextPoints = [sunPos.clone()];
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
  }, [sunPos]);
  const localSunFactorRef = React.useRef<number>(1);
  const sunFactorRef = props.sunFactorRef ?? localSunFactorRef;
  // eslint-disable-next-line no-null/no-null
  const starsRef = React.useRef<Material>(null);
  const origin = React.useMemo(() => new Vector3(0, 0, 0), []);
  const totalCycle = React.useMemo(
    () => getCycleLength(config.plants),
    [config.plants],
  );
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
  const shadowTarget = React.useMemo(() =>
    new Vector3(
      threeSpace(0, config.bedLengthOuter) + config.bedXOffset,
      threeSpace(0, config.bedWidthOuter) + config.bedYOffset,
      zZero(config),
    ), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.zGantryOffset,
  ]);

  const setSunSky = React.useCallback(
    (inclination: number, sunValue: number) => {
      sunFactorRef.current = calcSunI(inclination);
      props.skyRef.current?.color?.setRGB(
        ...skyColor(sunFactorRef.current * sunValue),
      );
      if (starsRef.current) {
        starsRef.current.opacity = (1 - sunFactorRef.current);
      }
    },
    [props.skyRef, sunFactorRef],
  );

  React.useEffect(() => {
    setSunSky(config.sunInclination, config.sun);
  }, [config.sun, config.sunInclination, setSunSky]);
  React.useLayoutEffect(() => {
    const light = lightRef.current;
    light?.target?.position?.copy(shadowTarget);
    light?.target?.updateMatrixWorld?.();
  }, [shadowTarget]);
  const animateSeasons = config.animateSeasons && !!props.startTimeRef;

  return <Group name={"sun"}>
    {animateSeasons && props.startTimeRef &&
      <SunAnimation
        startTimeRef={props.startTimeRef}
        sunFactorRef={sunFactorRef}
        sunIntensityBase={sunIntensityBase}
        sunValue={config.sun}
        totalCycle={totalCycle}
        lightRef={lightRef}
        sphereRef={sphereRef}
        sunRef={sunRef}
        sunFlatRef={sunFlatRef}
        lineRef={lineRef}
        pointsRef={pointsRef}
        setPoints={setPoints}
        setSunSky={setSunSky} />}
    <DirectionalLight
      ref={lightRef}
      intensity={sunIntensityBase * sunFactorRef.current}
      color={sunColor}
      castShadow={true}
      shadow-bias={shadowBias}
      shadow-normalBias={shadowNormalBias} // warning: distorts shadows
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
      onUpdate={light => {
        light.shadow?.camera?.updateProjectionMatrix?.();
        light.shadow?.camera?.updateMatrixWorld?.();
      }}
      position={sunPos}
    />
    {config.lightsDebug &&
      <Line
        ref={lineRef}
        points={[points[0], origin]}
        color={SUN_COLOR} />}
    {config.lightsDebug &&
      <Trail width={1000} color={"yellow"} length={100} attenuation={t => t}>
        <Sphere ref={sphereRef} args={[500, 16, 16]} position={sunPos}>
          <MeshBasicMaterial color={SUN_COLOR} />
        </Sphere>
      </Trail>}
    <Sphere
      ref={sunRef}
      args={[1000, 32, 32]}
      position={sunVisualPosition}>
      <MeshBasicMaterial color={SUN_COLOR} />
    </Sphere>
    <OtherSuns starsRef={starsRef} />
    {config.lightsDebug && <SkyGrid config={config} />}
    {config.lightsDebug && <Sphere
      ref={sunFlatRef}
      args={[500, 8, 8]}
      position={sunFlatPosition}>
      <MeshBasicMaterial color={SUN_COLOR} />
    </Sphere>}
  </Group>;
});

interface SunAnimationProps {
  startTimeRef: React.RefObject<number>;
  sunFactorRef: React.MutableRefObject<number>;
  sunIntensityBase: number;
  sunValue: number;
  totalCycle: number;
  lightRef: React.MutableRefObject<ThreeDirectionalLight | null>;
  sphereRef: React.MutableRefObject<Mesh | null>;
  sunRef: React.RefObject<Mesh | null>;
  sunFlatRef: React.RefObject<Mesh | null>;
  lineRef: React.RefObject<Line2 | null>;
  pointsRef: React.MutableRefObject<Vector3[]>;
  setPoints: React.Dispatch<React.SetStateAction<Vector3[]>>;
  setSunSky(inclination: number, sunValue: number): void;
}

const SunAnimation = (props: SunAnimationProps) => {
  useFrame(() => {
    const currentTime = performance.now() / 1000;
    const t = currentTime - props.startTimeRef.current;
    const timeOffset = Math.min(t / props.totalCycle, 1) * 24 * 60 * 60;
    const date = moment().utc().startOf("day")
      .add(timeOffset, "seconds").toDate();
    const { azimuth, inclination } = calcSunCoordinate(date, 0, 52, 0);
    const actualPos = sunPosition(inclination, azimuth, BigDistance.sunActual);

    props.setSunSky(inclination, props.sunValue);

    const intensity = props.sunIntensityBase * props.sunFactorRef.current;
    const light = props.lightRef.current;
    light?.position?.set?.(actualPos.x, actualPos.y, actualPos.z);
    if (light) {
      light.intensity = intensity;
    }
    props.sphereRef.current?.position?.set?.(
      actualPos.x,
      actualPos.y,
      actualPos.z,
    );

    const visualPos = sunPosition(inclination, azimuth, BigDistance.sunVisual);
    props.sunRef.current?.position?.set(
      visualPos.x,
      visualPos.y,
      visualPos.z,
    );
    const flatPos = sunPosition(0, azimuth, BigDistance.ground);
    props.sunFlatRef.current?.position?.set(
      flatPos.x,
      flatPos.y,
      flatPos.z,
    );

    if (props.lineRef.current) {
      const nextPoints = props.pointsRef.current;
      nextPoints[0]?.set(actualPos.x, actualPos.y, actualPos.z);
      props.setPoints([...nextPoints]);
    }
  });
  return null;
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

const OtherSuns = React.memo(
  ({ starsRef }: { starsRef: React.RefObject<Material | null> }) => {
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
  },
);

interface SkyGridProps {
  config: Config;
}

const SkyGrid = React.memo((props: SkyGridProps) => {
  const radius = BigDistance.ground;
  const angles = React.useMemo(() => range(0, 360, 15), []);
  const gridLines = React.useMemo(() => angles.map(angle => {
    const newAngle = (angle + props.config.heading) % 360;
    const [x, y, z] = polarToCartesian(radius, newAngle, 90);
    return { angle, position: [x, y, z] as [number, number, number] };
  }), [angles, props.config.heading, radius]);
  return <Group name={"sky-grid"}>
    {gridLines.map(({ angle, position }) => (
      <Group key={angle} name={`sky-grid-line-${angle}`}>
        <Line
          points={[[position[0], position[1], position[2] - 10000],
            [position[0], position[1], position[2] + 10000]]}
          lineWidth={5}
          color={"gray"} />
        <Billboard position={position}>
          <Text3D font={ASSETS.fonts.cabinBold} size={1000} height={1}>
            {`${360 - angle}°`}
            <MeshBasicMaterial color={"white"} />
          </Text3D>
        </Billboard>
      </Group>
    ))}
  </Group>;
});
