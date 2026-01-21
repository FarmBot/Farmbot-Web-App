import React from "react";
import { SpecialStatus, TaggedGenericPointer, Xyz } from "farmbot";
import { Config } from "../config";
import { Group, InstancedMesh, MeshPhongMaterial } from "../components";
import { Billboard, Cylinder, Sphere, Torus } from "@react-three/drei";
import {
  BufferAttribute,
  Color,
  CylinderGeometry,
  DoubleSide,
  InstancedMesh as ThreeInstancedMesh,
  MeshPhongMaterial as ThreeMeshPhongMaterial,
  Object3D,
  SphereGeometry,
} from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined, round } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { DesignerState } from "../../farm_designer/interfaces";
import { getMode } from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { WeedBase } from ".";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import {
  BillboardRef, ImageRef, RadiusRef, TorusRef,
} from "../bed/objects/pointer_objects";
import { ThreeEvent } from "@react-three/fiber";
import { clearGardenCursor, setGardenCursor } from "../cursor";
import { Text } from "../elements";

const POINT_PIN_RADIUS = 12.5;
const POINT_PIN_HEIGHT = 50;
const POINT_CYLINDER_HEIGHT = 25;
const POINT_CYLINDER_INNER_R_FRACTION = 0.95;
const POINT_CYLINDER_TUBE_SIZE = 1 - POINT_CYLINDER_INNER_R_FRACTION;
export const POINT_CYLINDER_SCALE_FACTOR =
  round(1 / POINT_CYLINDER_TUBE_SIZE ** 2);
const SEGMENTS = 64;
const POINT_LABEL_OFFSET = 40;
const POINT_LABEL_FONT_SIZE = 40;

const getPointLabel = (point: TaggedGenericPointer) => {
  if (point.body.name) { return point.body.name; }
  if (point.body.id) { return `Point ${point.body.id}`; }
  return "Point";
};

const applyVertexColors = (geometry: {
  attributes: { position?: { count: number } };
  setAttribute: (name: string, attr: BufferAttribute) => void;
}) => {
  const count = geometry.attributes.position?.count || 0;
  if (count === 0) { return; }
  const colors = new Float32Array(count * 3);
  colors.fill(1);
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
};

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
  enableClick?: boolean;
  renderMarker?: boolean;
}

export const Point = React.memo((props: PointProps) => {
  const { point, config } = props;
  const navigate = useNavigate();
  const enableClick = props.enableClick ?? true;
  const unsaved = React.useMemo(
    () => point.specialStatus !== SpecialStatus.SAVED,
    [point.specialStatus],
  );
  const canClick = enableClick
    && !!point.body.id
    && !isUndefined(props.dispatch)
    && props.visible
    && !HOVER_OBJECT_MODES.includes(getMode());
  const position = React.useMemo(() => ({
    x: point.body.x,
    y: point.body.y,
    z: props.getZ(point.body.x, point.body.y),
  }), [point.body.x, point.body.y, props.getZ]);
  const handleClick = React.useCallback(() => {
    if (!canClick || !point.body.id || isUndefined(props.dispatch)) { return; }
    props.dispatch(setPanelOpen(true));
    navigate(Path.points(point.body.id));
  }, [
    canClick,
    navigate,
    point.body.id,
    props.dispatch,
    props.visible,
  ]);
  const handlePointerEnter = React.useCallback(() => {
    if (!canClick) { return; }
    setGardenCursor("pointer");
  }, [canClick]);
  const handlePointerLeave = React.useCallback(() => {
    if (!canClick) { return; }
    clearGardenCursor();
  }, [canClick]);
  return <PointBase
    pointName={"" + point.body.id}
    alpha={unsaved ? 0.5 : 1}
    position={position}
    onClick={canClick ? handleClick : undefined}
    onPointerEnter={canClick ? handlePointerEnter : undefined}
    onPointerLeave={canClick ? handlePointerLeave : undefined}
    config={config}
    color={point.body.meta.color}
    radius={point.body.radius}
    renderMarker={props.renderMarker}
  />;
});

export interface DrawnPointProps {
  designer: DesignerState;
  usePosition: boolean;
  config: Config;
  radiusRef?: RadiusRef;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

export const DrawnPoint = (props: DrawnPointProps) => {
  const { config } = props;
  const { drawnPoint } = props.designer;
  const drawnPointPosition = React.useMemo(() => (
    drawnPoint && !isUndefined(drawnPoint.cx) && !isUndefined(drawnPoint.cy)
      ? { x: drawnPoint.cx, y: drawnPoint.cy, z: drawnPoint.z }
      : undefined
  ), [drawnPoint]);
  if (props.usePosition && isUndefined(drawnPointPosition)) { return <></>; }
  const Base = getMode() == Mode.createWeed ? WeedBase : PointBase;
  return <Base
    pointName={"drawn-point"}
    alpha={0.5}
    position={props.usePosition ? drawnPointPosition : undefined}
    color={drawnPoint?.color}
    config={config}
    radius={drawnPoint?.r || 0}
    radiusRef={props.radiusRef}
    torusRef={props.torusRef}
    billboardRef={props.billboardRef}
    imageRef={props.imageRef} />;
};

interface PointBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
  renderMarker?: boolean;
}

const PointBase = React.memo((props: PointBaseProps) => {
  const { config, radius } = props;
  const renderMarker = props.renderMarker ?? true;
  const rotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, 0], []);
  const position = React.useMemo<[number, number, number]>(() => (
    props.position
      ? [
        threeSpace(props.position.x, config.bedLengthOuter) + config.bedXOffset,
        threeSpace(props.position.y, config.bedWidthOuter) + config.bedYOffset,
        zeroFunc(config).z + props.position.z,
      ]
      : [0, 0, 0]
  ), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.zGantryOffset,
    props.position,
  ]);
  const pinPosition = React.useMemo<[number, number, number]>(
    () => [0, POINT_PIN_HEIGHT / 2, 0], []);
  const capPosition = React.useMemo<[number, number, number]>(
    () => [0, POINT_PIN_HEIGHT, 0], []);
  return <Group
    name={"point-" + props.pointName}
    renderOrder={RenderOrder.default}
    rotation={rotation}
    position={position}>
    {renderMarker &&
      <Group name={"marker"}
        onClick={props.onClick}
        onPointerEnter={props.onPointerEnter}
        onPointerLeave={props.onPointerLeave}>
        <Cylinder
          args={[POINT_PIN_RADIUS, 0, POINT_PIN_HEIGHT, 16, 2, true]}
          position={pinPosition}>
          <MeshPhongMaterial
            color={props.color}
            side={DoubleSide}
            transparent={true}
            opacity={1 * props.alpha} />
        </Cylinder>
        <Sphere
          args={[POINT_PIN_RADIUS, 16, 16]}
          position={capPosition}>
          <MeshPhongMaterial
            color={props.color}
            side={DoubleSide}
            transparent={true}
            opacity={1 * props.alpha} />
        </Sphere>
      </Group>}
    {radius > 0 &&
      <HollowCylinder
        torusRef={props.torusRef}
        radius={radius}
        thickness={10}
        color={props.color}
        alpha={0.5 * props.alpha} />}
  </Group>;
});

interface PointHoverLabelProps {
  label: string;
  position: [number, number, number];
}

const PointHoverLabel = React.memo((props: PointHoverLabelProps) =>
  <Billboard name={"point-label"} follow={true} position={props.position}>
    <Text
      renderOrder={RenderOrder.plantLabels}
      fontSize={POINT_LABEL_FONT_SIZE}
      color={"white"}
      disableRaycast={true}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}>
      {props.label}
    </Text>
  </Billboard>);

interface HollowCylinderProps {
  radius: number;
  thickness: number;
  color?: string;
  alpha: number;
  torusRef?: TorusRef;
}

const HollowCylinder = React.memo((props: HollowCylinderProps) => {
  const filledScale = React.useMemo<[number, number, number]>(() => ([
    props.radius,
    props.radius,
    POINT_CYLINDER_SCALE_FACTOR,
  ]), [props.radius]);
  const filledRotation = React.useMemo<[number, number, number]>(
    () => [-Math.PI / 2, 0, 0], []);
  const filledArgs = React.useMemo<[number, number, number, number]>(
    () => [1, POINT_CYLINDER_TUBE_SIZE, SEGMENTS, SEGMENTS], []);
  const hollowScale = React.useMemo<[number, number, number]>(
    () => [1, 1, POINT_CYLINDER_HEIGHT / 5], []);
  const hollowRotation = React.useMemo<[number, number, number]>(
    () => [-Math.PI / 2, 0, 0], []);
  const hollowArgs = React.useMemo<[number, number, number, number]>(
    () => [props.radius, 5, SEGMENTS, SEGMENTS],
    [props.radius],
  );
  return props.torusRef
    ? <Torus
      ref={props.torusRef}
      scale={filledScale}
      rotation={filledRotation}
      args={filledArgs}>
      <MeshPhongMaterial
        color={props.color}
        transparent={true}
        opacity={props.alpha} />
    </Torus>
    : <Torus
      rotation={hollowRotation}
      scale={hollowScale}
      args={hollowArgs}>
      <MeshPhongMaterial
        color={props.color}
        transparent={true}
        opacity={props.alpha} />
    </Torus>;
});

interface PointMarkerInstancesProps {
  points: TaggedGenericPointer[];
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

type InstanceData = {
  position: [number, number, number];
  color: Color;
};

export const PointMarkerInstances = React.memo(
  (props: PointMarkerInstancesProps) => {
    const navigate = useNavigate();
    const showHoverLabels =
      !!props.config.labels && !!props.config.labelsOnHover;
    const hoverMode = HOVER_OBJECT_MODES.includes(getMode());
    const allowHover = showHoverLabels && props.visible && !hoverMode;
    const canClick = !!props.dispatch
      && props.visible
      && !hoverMode;
    const [hoveredPointId, setHoveredPointId] = React.useState<
      string | undefined>(undefined);
    const hoveredPointIdRef = React.useRef<string | undefined>(undefined);
    const updateHoveredPointId = React.useCallback(
      (nextId: string | undefined) => {
        if (hoveredPointIdRef.current === nextId) { return; }
        hoveredPointIdRef.current = nextId;
        setHoveredPointId(nextId);
      },
      [],
    );
    const clearHoveredPointId = React.useCallback(
      () => updateHoveredPointId(undefined),
      [updateHoveredPointId],
    );
    React.useEffect(() => {
      if (allowHover) { return; }
      clearHoveredPointId();
    }, [allowHover, clearHoveredPointId]);
    const zeroZ = React.useMemo(
      () => zeroFunc(props.config).z,
      [props.config.columnLength, props.config.zGantryOffset],
    );
    const cylinderGeometry = React.useMemo(() => {
      const geometry = new CylinderGeometry(
        POINT_PIN_RADIUS,
        0,
        POINT_PIN_HEIGHT,
        16,
        2,
        true,
      );
      applyVertexColors(geometry);
      return geometry;
    }, []);
    const sphereGeometry = React.useMemo(() => {
      const geometry = new SphereGeometry(POINT_PIN_RADIUS, 16, 16);
      applyVertexColors(geometry);
      return geometry;
    }, []);
    const savedMaterial = React.useMemo(() => new ThreeMeshPhongMaterial({
      transparent: true,
      opacity: 1,
      vertexColors: true,
      side: DoubleSide,
    }), []);
    const unsavedMaterial = React.useMemo(() => new ThreeMeshPhongMaterial({
      transparent: true,
      opacity: 0.5,
      vertexColors: true,
      side: DoubleSide,
    }), []);
    React.useEffect(() => () => cylinderGeometry.dispose(), [cylinderGeometry]);
    React.useEffect(() => () => sphereGeometry.dispose(), [sphereGeometry]);
    React.useEffect(() => () => savedMaterial.dispose(), [savedMaterial]);
    React.useEffect(() => () => unsavedMaterial.dispose(), [unsavedMaterial]);

    const instanceData = React.useMemo(() => {
      const saved: InstanceData[] = [];
      const unsaved: InstanceData[] = [];
      const savedPoints: TaggedGenericPointer[] = [];
      const unsavedPoints: TaggedGenericPointer[] = [];
      props.points.forEach(point => {
        const basePosition: [number, number, number] = [
          threeSpace(point.body.x, props.config.bedLengthOuter)
          + props.config.bedXOffset,
          threeSpace(point.body.y, props.config.bedWidthOuter)
          + props.config.bedYOffset,
          zeroZ + props.getZ(point.body.x, point.body.y),
        ];
        const cylinderPosition: [number, number, number] = [
          basePosition[0],
          basePosition[1],
          basePosition[2] + POINT_PIN_HEIGHT / 2,
        ];
        const spherePosition: [number, number, number] = [
          basePosition[0],
          basePosition[1],
          basePosition[2] + POINT_PIN_HEIGHT,
        ];
        const color = new Color(point.body.meta.color || "red");
        const data = {
          cylinder: { position: cylinderPosition, color },
          sphere: { position: spherePosition, color },
        };
        const isSaved = point.specialStatus === SpecialStatus.SAVED;
        if (isSaved) {
          saved.push(data.cylinder, data.sphere);
          savedPoints.push(point, point);
        } else {
          unsaved.push(data.cylinder, data.sphere);
          unsavedPoints.push(point, point);
        }
      });
      return { saved, unsaved, savedPoints, unsavedPoints };
    }, [
      props.config.bedLengthOuter,
      props.config.bedWidthOuter,
      props.config.bedXOffset,
      props.config.bedYOffset,
      props.getZ,
      props.points,
      zeroZ,
    ]);

    const hoveredPoint = React.useMemo(() => props.points.find(point =>
      point.uuid === hoveredPointId,
    ), [hoveredPointId, props.points]);
    const hoveredPointPosition = React.useMemo<
      [number, number, number] | undefined>(() => {
        if (!hoveredPoint) { return undefined; }
        return [
          threeSpace(hoveredPoint.body.x, props.config.bedLengthOuter)
          + props.config.bedXOffset,
          threeSpace(hoveredPoint.body.y, props.config.bedWidthOuter)
          + props.config.bedYOffset,
          zeroZ + props.getZ(hoveredPoint.body.x, hoveredPoint.body.y)
          + POINT_PIN_HEIGHT + POINT_LABEL_OFFSET,
        ];
      }, [
      hoveredPoint,
      props.config.bedLengthOuter,
      props.config.bedWidthOuter,
      props.config.bedXOffset,
      props.config.bedYOffset,
      props.getZ,
      zeroZ,
    ]);

    const savedCylinderRef = React.useRef<ThreeInstancedMesh>(null);
    const savedSphereRef = React.useRef<ThreeInstancedMesh>(null);
    const unsavedCylinderRef = React.useRef<ThreeInstancedMesh>(null);
    const unsavedSphereRef = React.useRef<ThreeInstancedMesh>(null);
    const cylinderDummy = React.useMemo(() => new Object3D(), []);
    const sphereDummy = React.useMemo(() => new Object3D(), []);

    React.useLayoutEffect(() => {
      const mesh = savedCylinderRef.current;
      if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
      instanceData.saved
        .filter((_, index) => index % 2 === 0)
        .forEach((data, index) => {
          cylinderDummy.position.set(...data.position);
          cylinderDummy.rotation.set(Math.PI / 2, 0, 0);
          cylinderDummy.updateMatrix();
          mesh.setMatrixAt(index, cylinderDummy.matrix);
          mesh.setColorAt(index, data.color);
        });
      mesh.count = Math.floor(instanceData.saved.length / 2);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }, [cylinderDummy, instanceData]);

    React.useLayoutEffect(() => {
      const mesh = savedSphereRef.current;
      if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
      instanceData.saved
        .filter((_, index) => index % 2 === 1)
        .forEach((data, index) => {
          sphereDummy.position.set(...data.position);
          sphereDummy.rotation.set(0, 0, 0);
          sphereDummy.updateMatrix();
          mesh.setMatrixAt(index, sphereDummy.matrix);
          mesh.setColorAt(index, data.color);
        });
      mesh.count = Math.floor(instanceData.saved.length / 2);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }, [instanceData, sphereDummy]);

    React.useLayoutEffect(() => {
      const mesh = unsavedCylinderRef.current;
      if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
      instanceData.unsaved
        .filter((_, index) => index % 2 === 0)
        .forEach((data, index) => {
          cylinderDummy.position.set(...data.position);
          cylinderDummy.rotation.set(Math.PI / 2, 0, 0);
          cylinderDummy.updateMatrix();
          mesh.setMatrixAt(index, cylinderDummy.matrix);
          mesh.setColorAt(index, data.color);
        });
      mesh.count = Math.floor(instanceData.unsaved.length / 2);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }, [cylinderDummy, instanceData]);

    React.useLayoutEffect(() => {
      const mesh = unsavedSphereRef.current;
      if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
      instanceData.unsaved
        .filter((_, index) => index % 2 === 1)
        .forEach((data, index) => {
          sphereDummy.position.set(...data.position);
          sphereDummy.rotation.set(0, 0, 0);
          sphereDummy.updateMatrix();
          mesh.setMatrixAt(index, sphereDummy.matrix);
          mesh.setColorAt(index, data.color);
        });
      mesh.count = Math.floor(instanceData.unsaved.length / 2);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }, [instanceData, sphereDummy]);

    const onClick =
      (points: TaggedGenericPointer[]) =>
        (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (isUndefined(e.instanceId)) { return; }
          const point = points[e.instanceId];
          if (!point) { return; }
          if (point.body.id
            && !isUndefined(props.dispatch)
            && props.visible
            && !HOVER_OBJECT_MODES.includes(getMode())) {
            props.dispatch(setPanelOpen(true));
            navigate(Path.points(point.body.id));
          }
        };
    const onPointerEnter =
      (points: TaggedGenericPointer[]) =>
        (e: ThreeEvent<PointerEvent>) => {
          if (isUndefined(e.instanceId)) { return; }
          const point = points[e.instanceId];
          if (allowHover) {
            updateHoveredPointId(point?.uuid);
          }
          if (!canClick || !point?.body.id) { return; }
          setGardenCursor("pointer");
        };
    const onPointerMove =
      (points: TaggedGenericPointer[]) =>
        (e: ThreeEvent<PointerEvent>) => {
          if (!allowHover || isUndefined(e.instanceId)) { return; }
          const point = points[e.instanceId];
          updateHoveredPointId(point?.uuid);
        };
    const onPointerLeave = () => {
      if (allowHover) { clearHoveredPointId(); }
      if (canClick) { clearGardenCursor(); }
    };

    if (instanceData.saved.length === 0 && instanceData.unsaved.length === 0) {
      return null;
    }

    const savedPoints = instanceData.savedPoints.filter((_, i) => i % 2 === 0);
    const unsavedPoints =
      instanceData.unsavedPoints.filter((_, i) => i % 2 === 0);
    return <>
      {allowHover && hoveredPoint && hoveredPointPosition &&
        <PointHoverLabel
          label={getPointLabel(hoveredPoint)}
          position={hoveredPointPosition} />}
      {savedPoints.length > 0 &&
        <>
          <InstancedMesh
            ref={savedCylinderRef}
            args={[cylinderGeometry, savedMaterial, savedPoints.length]}
            renderOrder={RenderOrder.default}
            visible={props.visible}
            onClick={onClick(savedPoints)}
            onPointerEnter={canClick || allowHover
              ? onPointerEnter(savedPoints)
              : undefined}
            onPointerMove={allowHover ? onPointerMove(savedPoints) : undefined}
            onPointerLeave={canClick || allowHover ? onPointerLeave : undefined}
          />
          <InstancedMesh
            ref={savedSphereRef}
            args={[sphereGeometry, savedMaterial, savedPoints.length]}
            renderOrder={RenderOrder.default}
            visible={props.visible}
            onClick={onClick(savedPoints)}
            onPointerEnter={canClick || allowHover
              ? onPointerEnter(savedPoints)
              : undefined}
            onPointerMove={allowHover ? onPointerMove(savedPoints) : undefined}
            onPointerLeave={canClick || allowHover ? onPointerLeave : undefined}
          />
        </>}
      {unsavedPoints.length > 0 &&
        <>
          <InstancedMesh
            ref={unsavedCylinderRef}
            args={[cylinderGeometry, unsavedMaterial, unsavedPoints.length]}
            renderOrder={RenderOrder.default}
            visible={props.visible}
            onClick={onClick(unsavedPoints)}
            onPointerEnter={canClick || allowHover
              ? onPointerEnter(unsavedPoints)
              : undefined}
            onPointerMove={allowHover ? onPointerMove(unsavedPoints) : undefined}
            onPointerLeave={canClick || allowHover ? onPointerLeave : undefined}
          />
          <InstancedMesh
            ref={unsavedSphereRef}
            args={[sphereGeometry, unsavedMaterial, unsavedPoints.length]}
            renderOrder={RenderOrder.default}
            visible={props.visible}
            onClick={onClick(unsavedPoints)}
            onPointerEnter={canClick || allowHover
              ? onPointerEnter(unsavedPoints)
              : undefined}
            onPointerMove={allowHover ? onPointerMove(unsavedPoints) : undefined}
            onPointerLeave={canClick || allowHover ? onPointerLeave : undefined}
          />
        </>}
    </>;
  },
);
