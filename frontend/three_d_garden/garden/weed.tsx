import React from "react";
import { TaggedWeedPointer, Xyz } from "farmbot";
import { Config } from "../config";
import { ASSETS, HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import {
  Group,
  InstancedMesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
} from "../components";
import { Billboard, Plane, Sphere, useTexture } from "@react-three/drei";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode } from "../../farm_designer/map/util";
import {
  RadiusRef,
  BillboardRef,
  ImageRef,
} from "../bed/objects/pointer_objects";
import {
  BufferAttribute,
  Color,
  InstancedMesh as ThreeInstancedMesh,
  MeshPhongMaterial as ThreeMeshPhongMaterial,
  Object3D,
  SphereGeometry,
} from "three";
import { ThreeEvent } from "@react-three/fiber";
import { clearGardenCursor, setGardenCursor } from "../cursor";
import { Text } from "../elements";

export const WEED_IMG_SIZE_FRACTION = 0.89;
const WEED_ALPHA_TEST = 0.1;
const WEED_LABEL_OFFSET = 40;
const WEED_LABEL_FONT_SIZE = 40;

const getWeedLabel = (weed: TaggedWeedPointer) => {
  if (weed.body.name) { return weed.body.name; }
  if (weed.body.id) { return `Weed ${weed.body.id}`; }
  return "Weed";
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

export interface WeedProps {
  weed: TaggedWeedPointer;
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
  enableClick?: boolean;
  renderSphere?: boolean;
  imageRaycast?: boolean;
}

export const Weed = React.memo((props: WeedProps) => {
  const { weed, config } = props;
  const navigate = useNavigate();
  const enableClick = props.enableClick ?? true;
  const hoverMode = HOVER_OBJECT_MODES.includes(getMode());
  const allowPointer = props.visible;
  const canClick = enableClick
    && !!weed.body.id
    && !isUndefined(props.dispatch)
    && props.visible
    && !hoverMode;
  const handleClick = React.useCallback(() => {
    if (!canClick || !weed.body.id || isUndefined(props.dispatch)) { return; }
    props.dispatch(setPanelOpen(true));
    navigate(Path.weeds(weed.body.id));
  }, [
    canClick,
    navigate,
    props.dispatch,
    props.visible,
    weed.body.id,
  ]);
  const handlePointerEnter = React.useCallback(() => {
    if (!allowPointer) { return; }
    setGardenCursor("pointer");
  }, [allowPointer]);
  const handlePointerLeave = React.useCallback(() => {
    if (!allowPointer) { return; }
    clearGardenCursor();
  }, [allowPointer]);
  const position = React.useMemo(() => ({
    x: weed.body.x,
    y: weed.body.y,
    z: props.getZ(weed.body.x, weed.body.y),
  }), [props.getZ, weed.body.x, weed.body.y]);
  return <WeedBase
    pointName={"" + weed.body.id}
    alpha={1}
    onClick={canClick ? handleClick : undefined}
    onPointerEnter={allowPointer ? handlePointerEnter : undefined}
    onPointerLeave={allowPointer ? handlePointerLeave : undefined}
    position={position}
    config={config}
    color={weed.body.meta.color}
    radius={weed.body.radius}
    renderSphere={props.renderSphere}
    imageRaycast={props.imageRaycast} />;
});

interface WeedBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: () => void;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
  radiusRef?: RadiusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
  renderSphere?: boolean;
  imageRaycast?: boolean;
}

export const WeedBase = React.memo((props: WeedBaseProps) => {
  const { config } = props;
  const renderSphere = props.renderSphere ?? true;
  const imageRaycast = props.imageRaycast ?? true;
  const weedTexture = useTexture(ASSETS.other.weed);
  const weedSize = React.useMemo(
    () => props.radius == 0 ? 50 : props.radius,
    [props.radius],
  );
  const iconSize = React.useMemo(
    () => weedSize * WEED_IMG_SIZE_FRACTION,
    [weedSize],
  );
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
  const billboardPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, iconSize / 2],
    [iconSize],
  );
  const spherePosition = React.useMemo<[number, number, number]>(
    () => [0, 0, iconSize / 2],
    [iconSize],
  );
  return <Group
    name={"weed-" + props.pointName}
    position={position}
    onClick={props.onClick}
    onPointerEnter={props.onPointerEnter}
    onPointerLeave={props.onPointerLeave}>
    <Billboard
      ref={props.billboardRef}
      follow={true}
      position={billboardPosition}>
      <Plane
        ref={props.imageRef}
        renderOrder={RenderOrder.weedImages}
        raycast={imageRaycast ? undefined : () => undefined}
        scale={iconSize}
        position={[0, 0, 0]}>
        <MeshBasicMaterial
          map={weedTexture}
          alphaTest={WEED_ALPHA_TEST}
          transparent={true}
          opacity={props.alpha} />
      </Plane>
    </Billboard>
    {renderSphere &&
      <Sphere
        ref={props.radiusRef}
        scale={weedSize}
        renderOrder={RenderOrder.weedSpheres}
        args={[1, 32, 32]}
        position={spherePosition}>
        <MeshPhongMaterial
          color={props.color}
          depthWrite={false}
          transparent={true}
          opacity={0.5 * props.alpha} />
      </Sphere>}
  </Group>;
});

interface WeedHoverLabelProps {
  label: string;
  position: [number, number, number];
}

const WeedHoverLabel = React.memo((props: WeedHoverLabelProps) =>
  <Billboard name={"weed-label"} follow={true} position={props.position}>
    <Text
      renderOrder={RenderOrder.plantLabels}
      fontSize={WEED_LABEL_FONT_SIZE}
      color={"white"}
      disableRaycast={true}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}>
      {props.label}
    </Text>
  </Billboard>);

interface WeedSphereInstancesProps {
  weeds: TaggedWeedPointer[];
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
}

export const WeedSphereInstances = React.memo(
  (props: WeedSphereInstancesProps) => {
    const navigate = useNavigate();
    const showHoverLabels =
      !!props.config.labels && !!props.config.labelsOnHover;
    const hoverMode = HOVER_OBJECT_MODES.includes(getMode());
    const allowHover = showHoverLabels && props.visible && !hoverMode;
    const allowPointer = props.visible;
    const canClick = !!props.dispatch
      && props.visible
      && !hoverMode;
    const [hoveredWeedId, setHoveredWeedId] = React.useState<
      string | undefined>(undefined);
    const hoveredWeedIdRef = React.useRef<string | undefined>(undefined);
    const updateHoveredWeedId = React.useCallback(
      (nextId: string | undefined) => {
        if (hoveredWeedIdRef.current === nextId) { return; }
        hoveredWeedIdRef.current = nextId;
        setHoveredWeedId(nextId);
      },
      [],
    );
    const clearHoveredWeedId = React.useCallback(
      () => updateHoveredWeedId(undefined),
      [updateHoveredWeedId],
    );
    React.useEffect(() => {
      if (allowHover) { return; }
      clearHoveredWeedId();
    }, [allowHover, clearHoveredWeedId]);
    const zeroZ = React.useMemo(
      () => zeroFunc(props.config).z,
      [props.config.columnLength, props.config.zGantryOffset],
    );
    const sphereGeometry = React.useMemo(() => {
      const geometry = new SphereGeometry(1, 32, 32);
      applyVertexColors(geometry);
      return geometry;
    }, []);
    const sphereMaterial = React.useMemo(() => new ThreeMeshPhongMaterial({
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      vertexColors: true,
    }), []);
    React.useEffect(() => () => sphereGeometry.dispose(), [sphereGeometry]);
    React.useEffect(() => () => sphereMaterial.dispose(), [sphereMaterial]);
    const instanceData = React.useMemo(() => props.weeds.map(weed => {
      const weedSize = weed.body.radius == 0 ? 50 : weed.body.radius;
      const iconSize = weedSize * WEED_IMG_SIZE_FRACTION;
      return {
        position: [
          threeSpace(weed.body.x, props.config.bedLengthOuter)
          + props.config.bedXOffset,
          threeSpace(weed.body.y, props.config.bedWidthOuter)
          + props.config.bedYOffset,
          zeroZ + props.getZ(weed.body.x, weed.body.y) + iconSize / 2,
        ] as [number, number, number],
        scale: weedSize,
        color: new Color(weed.body.meta.color || "white"),
      };
    }), [
      props.config.bedLengthOuter,
      props.config.bedWidthOuter,
      props.config.bedXOffset,
      props.config.bedYOffset,
      props.getZ,
      props.weeds,
      zeroZ,
    ]);
    const hoveredWeed = React.useMemo(() => props.weeds.find(weed =>
      weed.uuid === hoveredWeedId,
    ), [hoveredWeedId, props.weeds]);
    const hoveredWeedPosition = React.useMemo<
      [number, number, number] | undefined>(() => {
        if (!hoveredWeed) { return undefined; }
        const weedSize =
          hoveredWeed.body.radius == 0 ? 50 : hoveredWeed.body.radius;
        const iconSize = weedSize * WEED_IMG_SIZE_FRACTION;
        return [
          threeSpace(hoveredWeed.body.x, props.config.bedLengthOuter)
          + props.config.bedXOffset,
          threeSpace(hoveredWeed.body.y, props.config.bedWidthOuter)
          + props.config.bedYOffset,
          zeroZ + props.getZ(hoveredWeed.body.x, hoveredWeed.body.y)
          + iconSize + WEED_LABEL_OFFSET,
        ];
      }, [
      hoveredWeed,
      props.config.bedLengthOuter,
      props.config.bedWidthOuter,
      props.config.bedXOffset,
      props.config.bedYOffset,
      props.getZ,
      zeroZ,
    ]);
    // eslint-disable-next-line no-null/no-null
    const meshRef = React.useRef<ThreeInstancedMesh>(null);
    const dummy = React.useMemo(() => new Object3D(), []);
    React.useLayoutEffect(() => {
      const mesh = meshRef.current;
      if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
      instanceData.forEach((data, index) => {
        dummy.position.set(...data.position);
        dummy.scale.set(data.scale, data.scale, data.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, data.color);
      });
      if ("count" in mesh) {
        mesh.count = instanceData.length;
      }
      if (mesh.instanceMatrix) {
        mesh.instanceMatrix.needsUpdate = true;
      }
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
    }, [dummy, instanceData]);
    const handleClick = React.useCallback((e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (isUndefined(e.instanceId)) { return; }
      const weed = props.weeds[e.instanceId];
      if (!weed) { return; }
      if (weed.body.id
        && !isUndefined(props.dispatch)
        && props.visible
        && !HOVER_OBJECT_MODES.includes(getMode())) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.weeds(weed.body.id));
      }
    }, [navigate, props.dispatch, props.visible, props.weeds]);
    const handlePointerEnter = React.useCallback(
      (weeds: TaggedWeedPointer[]) => (e: ThreeEvent<PointerEvent>) => {
        if (isUndefined(e.instanceId)) { return; }
        const weed = weeds[e.instanceId];
        if (!weed) { return; }
        if (allowHover) {
          updateHoveredWeedId(weed.uuid);
        }
        if (allowPointer) { setGardenCursor("pointer"); }
        if (!canClick || !weed.body.id) { return; }
      },
      [allowHover, allowPointer, canClick, updateHoveredWeedId],
    );
    const handlePointerMove = React.useCallback(
      (weeds: TaggedWeedPointer[]) => (e: ThreeEvent<PointerEvent>) => {
        if (!allowHover || isUndefined(e.instanceId)) { return; }
        const weed = weeds[e.instanceId];
        if (!weed) { return; }
        updateHoveredWeedId(weed.uuid);
      },
      [allowHover, updateHoveredWeedId],
    );
    const handlePointerLeave = React.useCallback(() => {
      if (allowHover) { clearHoveredWeedId(); }
      if (allowPointer) { clearGardenCursor(); }
    }, [allowHover, allowPointer, clearHoveredWeedId]);
    if (instanceData.length === 0) { return null; }
    return <>
      {allowHover && hoveredWeed && hoveredWeedPosition &&
        <WeedHoverLabel
          label={getWeedLabel(hoveredWeed)}
          position={hoveredWeedPosition} />}
      <InstancedMesh
        ref={meshRef}
        args={[sphereGeometry, sphereMaterial, instanceData.length]}
        renderOrder={RenderOrder.weedSpheres}
        visible={props.visible}
        onClick={handleClick}
        onPointerEnter={allowPointer || allowHover
          ? handlePointerEnter(props.weeds)
          : undefined}
        onPointerMove={allowHover ? handlePointerMove(props.weeds) : undefined}
        onPointerLeave={allowPointer || allowHover
          ? handlePointerLeave
          : undefined}
      />
    </>;
  },
);
