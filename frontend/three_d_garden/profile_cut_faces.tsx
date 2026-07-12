import React from "react";
import { range } from "lodash";
import {
  BufferGeometry, DoubleSide, Float32BufferAttribute, Plane, RepeatWrapping,
} from "three";
import { Config } from "./config";
import { ASSETS, BigDistance } from "./constants";
import {
  get3DPositionFunc, getColorFromBrightness, getGardenPositionFunc, zZero,
} from "./helpers";
import { Group, Mesh, MeshPhongMaterial } from "./components";
import { ThreeDProfileAxis } from "../farm_designer/interfaces";
import { soilSurfaceExtents } from "./triangles";
import { PROFILE_CLIPPING_EXEMPT } from "./profile";
import { TexturedGroundMaterial } from "./garden/ground";
import { TexturedBedMaterial } from "./bed";
import { useTextureVariant } from "./texture_variants";

type ProfileAxis = ThreeDProfileAxis;

interface VerticalFacePoint {
  transverse: number;
  top: number;
  bottom: number;
}

const verticalFaceGeometry = (
  axis: ProfileAxis,
  fixed: number,
  points: VerticalFacePoint[],
) => {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const first = points[0];
  const last = points[points.length - 1];
  const transverseSpan = last.transverse - first.transverse || 1;
  const minZ = Math.min(...points.map(point => point.bottom));
  const maxZ = Math.max(...points.map(point => point.top));
  const zSpan = maxZ - minZ || 1;
  const vertex = (transverse: number, z: number) =>
    axis == "x" ? [fixed, transverse, z] : [transverse, fixed, z];
  const uv = (point: VerticalFacePoint, z: number) => [
    (point.transverse - first.transverse) / transverseSpan,
    (z - minZ) / zSpan,
  ];
  for (let index = 0; index < points.length - 1; index++) {
    const current = points[index];
    const next = points[index + 1];
    vertices.push(
      ...vertex(current.transverse, current.bottom),
      ...vertex(next.transverse, next.bottom),
      ...vertex(next.transverse, next.top),
      ...vertex(current.transverse, current.bottom),
      ...vertex(next.transverse, next.top),
      ...vertex(current.transverse, current.top),
    );
    uvs.push(
      ...uv(current, current.bottom),
      ...uv(next, next.bottom),
      ...uv(next, next.top),
      ...uv(current, current.bottom),
      ...uv(next, next.top),
      ...uv(current, current.top),
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
};

export const getProfileNearPosition = (
  plane: Plane,
  axis: ProfileAxis,
) => {
  const normal = plane.normal[axis];
  return normal == 0 ? 0 : -plane.constant / normal;
};

const inRange = (value: number, min: number, max: number) =>
  value >= min && value <= max;

const bedCrossSectionIntervals = (
  fixed: number,
  axisLength: number,
  transverseLength: number,
  thickness: number,
): [number, number][] => {
  const axisMin = -axisLength / 2;
  const axisMax = axisLength / 2;
  if (!inRange(fixed, axisMin, axisMax)) { return []; }
  const transverseMin = -transverseLength / 2;
  const transverseMax = transverseLength / 2;
  const innerAxisMin = axisMin + thickness;
  const innerAxisMax = axisMax - thickness;
  if (!inRange(fixed, innerAxisMin, innerAxisMax)) {
    return [[transverseMin, transverseMax]];
  }
  return [
    [transverseMin, transverseMin + thickness],
    [transverseMax - thickness, transverseMax],
  ];
};

interface ProfileCutGeometryProps {
  config: Config;
  axis: ThreeDProfileAxis;
  nearPlane: Plane;
  getZ(x: number, y: number): number;
}

export interface ProfileCutGeometries {
  soil: BufferGeometry | undefined;
  bed: BufferGeometry[];
  ground: BufferGeometry | undefined;
}

export const getProfileCutGeometries = (
  props: ProfileCutGeometryProps,
): ProfileCutGeometries => {
  const { config, axis, nearPlane, getZ } = props;
  const transverse: ProfileAxis = axis == "x" ? "y" : "x";
  const fixed = getProfileNearPosition(nearPlane, axis);
  const axisLength = axis == "x"
    ? config.bedLengthOuter
    : config.bedWidthOuter;
  const transverseLength = transverse == "x"
    ? config.bedLengthOuter
    : config.bedWidthOuter;
  const bed = bedCrossSectionIntervals(
    fixed,
    axisLength,
    transverseLength,
    config.bedWallThickness,
  ).map(([min, max]) => verticalFaceGeometry(axis, fixed, [
    { transverse: min, top: 0, bottom: -config.bedHeight },
    { transverse: max, top: 0, bottom: -config.bedHeight },
  ]));

  const getGardenPosition = getGardenPositionFunc(config, false);
  const fixedGardenPosition = getGardenPosition({
    x: axis == "x" ? fixed : 0,
    y: axis == "y" ? fixed : 0,
  })[axis];
  const extents = soilSurfaceExtents(config);
  let soil: BufferGeometry | undefined;
  if (inRange(
    fixedGardenPosition,
    extents[axis].min,
    extents[axis].max,
  )) {
    const transverseMin = extents[transverse].min;
    const transverseMax = extents[transverse].max;
    const sampleCount = Math.max(
      1,
      Math.ceil((transverseMax - transverseMin) / 100),
    );
    const get3DPosition = get3DPositionFunc(config);
    const points = range(sampleCount + 1).map(index => {
      const transverseGardenPosition = transverseMin
        + (transverseMax - transverseMin) * index / sampleCount;
      const gardenPosition = {
        x: axis == "x" ? fixedGardenPosition : transverseGardenPosition,
        y: axis == "y" ? fixedGardenPosition : transverseGardenPosition,
      };
      return {
        transverse: get3DPosition(gardenPosition)[transverse],
        top: zZero(config) + getZ(gardenPosition.x, gardenPosition.y),
        bottom: -config.bedHeight,
      };
    });
    soil = verticalFaceGeometry(axis, fixed, points);
  }

  let ground: BufferGeometry | undefined;
  if (config.ground && Math.abs(fixed) <= BigDistance.ground) {
    const halfChord = Math.sqrt(BigDistance.ground ** 2 - fixed ** 2);
    const top = -config.bedHeight - config.bedZOffset;
    ground = verticalFaceGeometry(axis, fixed, [
      {
        transverse: -halfChord,
        top,
        bottom: top - BigDistance.ground,
      },
      {
        transverse: halfChord,
        top,
        bottom: top - BigDistance.ground,
      },
    ]);
  }

  return { soil, bed, ground };
};

export const ProfileCutFaces = (props: ProfileCutGeometryProps) => {
  const { config, getZ, nearPlane, axis } = props;
  const geometries = React.useMemo(
    () => getProfileCutGeometries({ config, getZ, nearPlane, axis }),
    [axis, config, getZ, nearPlane],
  );
  React.useEffect(() => () => {
    geometries.soil?.dispose();
    geometries.bed.map(geometry => geometry.dispose());
    geometries.ground?.dispose();
  }, [geometries]);
  const soilTexture = useTextureVariant(ASSETS.textures.soil + "?=soilT", {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [2, 1],
  });
  const bedColor = getColorFromBrightness(config.bedBrightness);
  const soilColor = getColorFromBrightness(config.soilBrightness);
  return <Group name={"profile-cut-faces"}
    userData={{ [PROFILE_CLIPPING_EXEMPT]: true }}>
    {geometries.ground &&
      <Mesh name={"profile-ground-cut-face"} geometry={geometries.ground}>
        <TexturedGroundMaterial
          sceneName={config.scene}
          side={DoubleSide} />
      </Mesh>}
    {geometries.bed.map((geometry, index) =>
      <Mesh key={index} name={"profile-bed-cut-face"} geometry={geometry}>
        <TexturedBedMaterial bedColor={bedColor} repeat={[1, 1]} />
      </Mesh>)}
    {geometries.soil &&
      <Mesh name={"profile-soil-cut-face"} geometry={geometries.soil}>
        <MeshPhongMaterial
          map={soilTexture}
          color={soilColor}
          side={DoubleSide}
          shininess={0} />
      </Mesh>}
  </Group>;
};
