import React from "react";
import { Line } from "@react-three/drei";
import { range } from "lodash";
import {
  BufferGeometry, DoubleSide, Float32BufferAttribute, Plane, RepeatWrapping,
} from "three";
import { Config } from "./config";
import { ASSETS } from "./constants";
import {
  get3DPositionFunc, getColorFromBrightness, getGardenPositionFunc, zZero,
} from "./helpers";
import { Group, Mesh, MeshPhongMaterial } from "./components";
import { ThreeDSectionAxis } from "../farm_designer/interfaces";
import { soilSurfaceExtents } from "./triangles";
import { SECTION_CLIPPING_EXEMPT } from "./section";
import { TexturedBedMaterial } from "./bed";
import { useTextureVariant } from "./texture_variants";

type SectionAxis = ThreeDSectionAxis;
type Point = [number, number, number];

const SECTION_SOIL_CUT_LINE_COLOR = "white";
const SECTION_SOIL_CUT_LINE_WIDTH = 2;
export const SECTION_SOIL_CUT_LINE_RENDER_ORDER = 1002;

interface VerticalFacePoint {
  transverse: number;
  top: number;
  bottom: number;
}

const verticalFaceGeometry = (
  axis: SectionAxis,
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

export const getSectionNearPosition = (
  plane: Plane,
  axis: SectionAxis,
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

export interface SectionCutGeometryProps {
  config: Config;
  axis: ThreeDSectionAxis;
  nearPlane: Plane;
  getZ(x: number, y: number): number;
}

export interface SectionCutGeometries {
  soil: BufferGeometry | undefined;
  soilLine: Point[];
  bed: BufferGeometry[];
}

export const getSectionSoilCutLinePoints = (
  props: SectionCutGeometryProps,
): Point[] => {
  const { config, axis, nearPlane, getZ } = props;
  const transverse: SectionAxis = axis == "x" ? "y" : "x";
  const fixed = getSectionNearPosition(nearPlane, axis);
  const getGardenPosition = getGardenPositionFunc(config, false);
  const fixedGardenPosition = getGardenPosition({
    x: axis == "x" ? fixed : 0,
    y: axis == "y" ? fixed : 0,
  })[axis];
  const extents = soilSurfaceExtents(config);
  if (!inRange(
    fixedGardenPosition,
    extents[axis].min,
    extents[axis].max,
  )) {
    return [];
  }
  const transverseMin = extents[transverse].min;
  const transverseMax = extents[transverse].max;
  const sampleCount = Math.max(
    1,
    Math.ceil((transverseMax - transverseMin) / 100),
  );
  const get3DPosition = get3DPositionFunc(config);
  return range(sampleCount + 1).map(index => {
    const transverseGardenPosition = transverseMin
      + (transverseMax - transverseMin) * index / sampleCount;
    const gardenPosition = {
      x: axis == "x" ? fixedGardenPosition : transverseGardenPosition,
      y: axis == "y" ? fixedGardenPosition : transverseGardenPosition,
    };
    const position = get3DPosition(gardenPosition);
    const z = zZero(config) + getZ(gardenPosition.x, gardenPosition.y);
    return axis == "x"
      ? [fixed, position.y, z]
      : [position.x, fixed, z];
  });
};

export const getSectionCutGeometries = (
  props: SectionCutGeometryProps,
): SectionCutGeometries => {
  const { config, axis, nearPlane } = props;
  const transverse: SectionAxis = axis == "x" ? "y" : "x";
  const fixed = getSectionNearPosition(nearPlane, axis);
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

  const soilLine = getSectionSoilCutLinePoints(props);
  let soil: BufferGeometry | undefined;
  if (soilLine.length > 1) {
    const transverseIndex = axis == "x" ? 1 : 0;
    const points = soilLine.map(point => ({
      transverse: point[transverseIndex],
      top: point[2],
      bottom: -config.bedHeight,
    }));
    soil = verticalFaceGeometry(axis, fixed, points);
  }

  return { soil, soilLine, bed };
};

interface SectionCutFacesProps extends SectionCutGeometryProps {
  farPlane: Plane;
  cutAll: boolean;
  opacity: number;
}

const sectionCutLineNoRaycast = () => undefined;

export const SectionCutFaces = (props: SectionCutFacesProps) => {
  const { config, getZ, nearPlane, axis } = props;
  const geometries = React.useMemo(
    () => getSectionCutGeometries({ config, getZ, nearPlane, axis }),
    [axis, config, getZ, nearPlane],
  );
  const farSoilLine = React.useMemo(() => props.cutAll
    ? getSectionSoilCutLinePoints({
      config,
      getZ,
      nearPlane: props.farPlane,
      axis,
    })
    : [], [axis, config, getZ, props.cutAll, props.farPlane]);
  React.useEffect(() => () => {
    geometries.soil?.dispose();
    geometries.bed.map(geometry => geometry.dispose());
  }, [geometries]);
  const soilTexture = useTextureVariant(ASSETS.textures.soil + "?=soilT", {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [2, 1],
  });
  const bedColor = getColorFromBrightness(config.bedBrightness);
  const soilColor = getColorFromBrightness(config.soilBrightness);
  return <Group name={"section-cut-faces"}
    userData={{ [SECTION_CLIPPING_EXEMPT]: true }}>
    {geometries.bed.map((geometry, index) =>
      <Mesh
        key={index}
        name={"section-bed-cut-face"}
        geometry={geometry}
        receiveShadow={true}>
        <TexturedBedMaterial bedColor={bedColor} repeat={[1, 1]} />
      </Mesh>)}
    {geometries.soil &&
      <Mesh
        name={"section-soil-cut-face"}
        geometry={geometries.soil}
        receiveShadow={true}>
        <MeshPhongMaterial
          map={soilTexture}
          color={soilColor}
          side={DoubleSide}
          shininess={0} />
      </Mesh>}
    {geometries.soilLine.length > 1 &&
      <Line
        name={"section-soil-near-cut-line"}
        points={geometries.soilLine}
        color={SECTION_SOIL_CUT_LINE_COLOR}
        lineWidth={SECTION_SOIL_CUT_LINE_WIDTH}
        transparent={true}
        opacity={props.opacity}
        renderOrder={SECTION_SOIL_CUT_LINE_RENDER_ORDER}
        raycast={sectionCutLineNoRaycast} />}
    {farSoilLine.length > 1 &&
      <Line
        name={"section-soil-far-cut-line"}
        points={farSoilLine}
        color={SECTION_SOIL_CUT_LINE_COLOR}
        lineWidth={SECTION_SOIL_CUT_LINE_WIDTH}
        transparent={true}
        opacity={props.opacity}
        renderOrder={SECTION_SOIL_CUT_LINE_RENDER_ORDER}
        raycast={sectionCutLineNoRaycast} />}
  </Group>;
};
