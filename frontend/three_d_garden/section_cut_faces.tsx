import React from "react";
import { Line } from "@react-three/drei";
import { range } from "lodash";
import {
  BufferGeometry, DoubleSide, Euler, Float32BufferAttribute, Matrix4, Plane,
  Quaternion, RepeatWrapping, Shape, ShapeGeometry, Vector3,
} from "three";
import { Config, PositionConfig } from "./config";
import { ASSETS } from "./constants";
import {
  get3DPositionFunc, get3DPositionNoMirrorFunc, getColorFromBrightness,
  getGardenPositionFunc, zero as zeroFunc, zDir as zDirFunc, zZero,
} from "./helpers";
import { Group, Mesh, MeshPhongMaterial } from "./components";
import { ThreeDSectionAxis } from "../farm_designer/interfaces";
import { soilSurfaceExtents } from "./triangles";
import { SECTION_CLIPPING_EXEMPT } from "./section";
import { TexturedBedMaterial } from "./bed";
import { useTextureVariant } from "./texture_variants";
import { buildCableCarrierShape } from
  "./bot/components/cable_carrier_geometry";
import { getBotVersion } from "./bot/bot_versions";

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

export interface SectionBoundsCutLine {
  color: string;
  name: string;
  points: Point[];
}

export const getSectionBoundsCutLines = (
  config: Config,
  axis: SectionAxis,
  plane: Plane,
): SectionBoundsCutLine[] => {
  if (!config.bounds) { return []; }
  const fixed = getSectionNearPosition(plane, axis);
  const zero = zeroFunc(config);
  const end = {
    x: zero.x + config.botSizeX,
    y: zero.y + config.botSizeY,
  };
  const axisMin = Math.min(zero[axis], end[axis]);
  const axisMax = Math.max(zero[axis], end[axis]);
  if (!inRange(fixed, axisMin, axisMax)) { return []; }
  const transverse = axis == "x" ? "y" : "x";
  const transverseMin = Math.min(zero[transverse], end[transverse]);
  const transverseMax = Math.max(zero[transverse], end[transverse]);
  const point = (transversePosition: number, z: number): Point =>
    axis == "x"
      ? [fixed, transversePosition, z]
      : [transversePosition, fixed, z];
  const top = zero.z;
  const bottom = zero.z - config.botSizeZ;
  const horizontalLine = (
    name: string,
    color: string,
    z: number,
  ): SectionBoundsCutLine => ({
    name,
    color,
    points: [point(transverseMin, z), point(transverseMax, z)],
  });
  return [
    {
      name: "bounds",
      color: "white",
      points: [
        point(transverseMin, bottom),
        point(transverseMax, bottom),
        point(transverseMax, top),
        point(transverseMin, top),
        point(transverseMin, bottom),
      ],
    },
    horizontalLine("safe-height", "green", zero.z + config.safeHeight),
    horizontalLine("min-soil", "#8b5a2b", zero.z + config.minSoilZ),
    horizontalLine("max-soil", "#8b5a2b", zero.z + config.maxSoilZ),
  ];
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

export interface SectionObjectCutGeometries {
  bedCableCarrierSupports: BufferGeometry[];
  cableCarriers: BufferGeometry[];
}

interface BoxBounds {
  x: [number, number];
  y: [number, number];
  z: [number, number];
}

const boxSectionGeometry = (
  axis: SectionAxis,
  fixed: number,
  bounds: BoxBounds,
) => {
  if (!inRange(fixed, ...bounds[axis])) { return undefined; }
  const transverse = axis == "x" ? "y" : "x";
  return verticalFaceGeometry(axis, fixed, [
    {
      transverse: bounds[transverse][0],
      top: bounds.z[1],
      bottom: bounds.z[0],
    },
    {
      transverse: bounds[transverse][1],
      top: bounds.z[1],
      bottom: bounds.z[0],
    },
  ]);
};

interface ExtrudedShapeSectionProps {
  axis: SectionAxis;
  fixed: number;
  shape: Shape;
  depth: number;
  position: [number, number, number];
  rotation: [number, number, number];
}

const getShapeVerticalLineIntervals = (
  shape: Shape,
  axis: "x" | "y",
  fixed: number,
): [number, number][] => {
  const points = shape.extractPoints(12).shape;
  const intersections: number[] = [];
  const transverse = axis == "x" ? "y" : "x";
  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const crosses = point[axis] <= fixed && next[axis] > fixed
      || next[axis] <= fixed && point[axis] > fixed;
    if (!crosses) { return; }
    const amount = (fixed - point[axis])
      / (next[axis] - point[axis]);
    intersections.push(
      point[transverse]
      + amount * (next[transverse] - point[transverse]),
    );
  });
  intersections.sort((a, b) => a - b);
  return range(0, intersections.length - 1, 2).map(index => [
    intersections[index],
    intersections[index + 1],
  ]);
};

const shapeLineSectionGeometry = (
  shape: Shape,
  axis: "x" | "y",
  fixed: number,
  depth: number,
) => {
  const vertices: number[] = [];
  getShapeVerticalLineIntervals(shape, axis, fixed)
    .forEach(([min, max]) => {
      const point = (transverse: number, z: number) => axis == "x"
        ? [fixed, transverse, z]
        : [transverse, fixed, z];
      vertices.push(
        ...point(min, 0),
        ...point(max, 0),
        ...point(max, depth),
        ...point(min, 0),
        ...point(max, depth),
        ...point(min, depth),
      );
    });
  if (vertices.length == 0) { return undefined; }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
};

const extrudedShapeSectionGeometry = (
  props: ExtrudedShapeSectionProps,
) => {
  const rotation = new Quaternion().setFromEuler(new Euler(...props.rotation));
  const transform = new Matrix4().compose(
    new Vector3(...props.position),
    rotation,
    new Vector3(1, 1, 1),
  );
  const worldNormal = props.axis == "x"
    ? new Vector3(1, 0, 0)
    : new Vector3(0, 1, 0);
  const localPlane = new Plane(worldNormal, -props.fixed)
    .applyMatrix4(transform.clone().invert());
  const axes = ["x", "y", "z"] as const;
  const localAxis = axes.reduce((largest, axis) =>
    Math.abs(localPlane.normal[axis]) > Math.abs(localPlane.normal[largest])
      ? axis
      : largest);
  const localFixed = -localPlane.constant / localPlane.normal[localAxis];
  let geometry: BufferGeometry | undefined;
  if (localAxis == "z") {
    if (!inRange(localFixed, 0, props.depth)) { return undefined; }
    geometry = new ShapeGeometry(props.shape, 12);
    geometry.translate(0, 0, localFixed);
  } else if (localAxis == "x" || localAxis == "y") {
    geometry = shapeLineSectionGeometry(
      props.shape,
      localAxis,
      localFixed,
      props.depth,
    );
  }
  geometry?.applyMatrix4(transform);
  return geometry;
};

const getBedCableCarrierSupportSections = (
  config: Config,
  axis: SectionAxis,
  fixed: number,
) => {
  const size = config.ccSupportSize;
  if (size <= 0) { return []; }
  const yBounds: [number, number] = [
    -config.bedWidthOuter / 2 - size,
    -config.bedWidthOuter / 2,
  ];
  const support = (
    x: [number, number],
    top: number,
  ) => boxSectionGeometry(axis, fixed, {
    x,
    y: yBounds,
    z: [top - size, top],
  });
  return [
    support(
      [-config.bedLengthOuter / 2, 0],
      -Math.min(150, config.bedHeight / 2),
    ),
    support([0, config.bedLengthOuter / 2], -50),
  ].filter((geometry): geometry is BufferGeometry => !!geometry);
};

const getCableCarrierSections = (
  config: Config,
  configPosition: PositionConfig,
  axis: SectionAxis,
  fixed: number,
) => {
  const get3DPosition = get3DPositionNoMirrorFunc(config);
  const bedCCSupportHeight = Math.min(150, config.bedHeight / 2);
  const botVersion = getBotVersion(config.kitVersion);
  const xPosition = get3DPosition({
    x: config.botSizeX / 2 - 11,
    y: (config.tracks ? 0 : 20) - 15 - config.bedYOffset,
  });
  const yPosition = get3DPosition({
    x: configPosition.x - 39,
    y: 20,
  });
  const zPosition = get3DPosition({
    x: configPosition.x - 52,
    y: configPosition.y - botVersion.zCCDepth + 35,
  });
  const zDir = zDirFunc(config);
  return [
    extrudedShapeSectionGeometry({
      axis,
      fixed,
      shape: buildCableCarrierShape(
        config.botSizeX / 2,
        config.botSizeX / 2 - configPosition.x + 31,
        bedCCSupportHeight - 40,
        true,
      ),
      depth: 22,
      position: [xPosition.x, xPosition.y, -40],
      rotation: [-Math.PI / 2, -Math.PI, 0],
    }),
    extrudedShapeSectionGeometry({
      axis,
      fixed,
      shape: buildCableCarrierShape(
        config.botSizeY,
        configPosition.y + 40,
        70,
      ),
      depth: botVersion.yCCDepth,
      position: [yPosition.x, yPosition.y, config.columnLength + 150],
      rotation: [-Math.PI / 2, -Math.PI / 2, 0],
    }),
    extrudedShapeSectionGeometry({
      axis,
      fixed,
      shape: buildCableCarrierShape(
        config.botSizeZ + config.zGantryOffset - 100,
        zDir * configPosition.z + config.zGantryOffset - 15,
        87,
      ),
      depth: botVersion.zCCDepth,
      position: [
        zPosition.x,
        zPosition.y,
        zZero(config) - zDir * configPosition.z + 125,
      ],
      rotation: [Math.PI / 2, Math.PI, Math.PI / 2],
    }),
  ].filter((geometry): geometry is BufferGeometry => !!geometry);
};

export const getSectionObjectCutGeometries = (
  config: Config,
  configPosition: PositionConfig,
  axis: SectionAxis,
  nearPlane: Plane,
): SectionObjectCutGeometries => {
  if (!config.cableCarriers) {
    return { bedCableCarrierSupports: [], cableCarriers: [] };
  }
  const fixed = getSectionNearPosition(nearPlane, axis);
  return {
    bedCableCarrierSupports:
      getBedCableCarrierSupportSections(config, axis, fixed),
    cableCarriers: config.bot
      ? getCableCarrierSections(config, configPosition, axis, fixed)
      : [],
  };
};

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
  configPosition: PositionConfig;
  farPlane: Plane;
  clipAll: boolean;
  opacity: number;
}

const sectionCutLineNoRaycast = () => undefined;

export const SectionCutFaces = (props: SectionCutFacesProps) => {
  const { config, getZ, nearPlane, axis } = props;
  const geometries = React.useMemo(
    () => getSectionCutGeometries({ config, getZ, nearPlane, axis }),
    [axis, config, getZ, nearPlane],
  );
  const objectGeometries = React.useMemo(
    () => getSectionObjectCutGeometries(
      config,
      props.configPosition,
      axis,
      nearPlane,
    ),
    [axis, config, nearPlane, props.configPosition],
  );
  const farSoilLine = React.useMemo(() => props.clipAll
    ? getSectionSoilCutLinePoints({
      config,
      getZ,
      nearPlane: props.farPlane,
      axis,
    })
    : [], [axis, config, getZ, props.clipAll, props.farPlane]);
  const nearBoundsLines = React.useMemo(
    () => getSectionBoundsCutLines(config, axis, nearPlane),
    [axis, config, nearPlane],
  );
  const farBoundsLines = React.useMemo(() => props.clipAll
    ? getSectionBoundsCutLines(config, axis, props.farPlane)
    : [], [axis, config, props.clipAll, props.farPlane]);
  React.useEffect(() => () => {
    geometries.soil?.dispose();
    geometries.bed.map(geometry => geometry.dispose());
  }, [geometries]);
  React.useEffect(() => () => {
    objectGeometries.bedCableCarrierSupports
      .forEach(geometry => geometry.dispose());
    objectGeometries.cableCarriers.forEach(geometry => geometry.dispose());
  }, [objectGeometries]);
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
    {objectGeometries.bedCableCarrierSupports.map((geometry, index) =>
      <Mesh
        key={index}
        name={"section-bed-cc-support-cut-face"}
        geometry={geometry}
        receiveShadow={true}>
        <TexturedBedMaterial bedColor={bedColor} repeat={[1, 1]} />
      </Mesh>)}
    {objectGeometries.cableCarriers.map((geometry, index) =>
      <Mesh
        key={index}
        name={"section-cable-carrier-cut-face"}
        geometry={geometry}
        receiveShadow={true}>
        <MeshPhongMaterial color={"#333"} side={DoubleSide} />
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
    {nearBoundsLines.map(line =>
      <Line
        key={`near-${line.name}`}
        name={`section-${line.name}-near-cut-line`}
        points={line.points}
        color={line.color}
        lineWidth={2}
        transparent={true}
        opacity={props.opacity}
        renderOrder={SECTION_SOIL_CUT_LINE_RENDER_ORDER}
        raycast={sectionCutLineNoRaycast} />)}
    {farBoundsLines.map(line =>
      <Line
        key={`far-${line.name}`}
        name={`section-${line.name}-far-cut-line`}
        points={line.points}
        color={line.color}
        lineWidth={2}
        transparent={true}
        opacity={props.opacity}
        renderOrder={SECTION_SOIL_CUT_LINE_RENDER_ORDER}
        raycast={sectionCutLineNoRaycast} />)}
  </Group>;
};
