import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard, Detailed, Plane, Sphere, useTexture } from
  "@react-three/drei";
import {
  Vector3,
  Mesh,
  Group as GroupType,
  Color,
  InstancedMesh as ThreeInstancedMesh,
  MeshBasicMaterial as ThreeMeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  WebGLProgramParametersWithUniforms,
} from "three";
import {
  getGardenPositionFunc,
  threeSpace,
  zZero,
  zZero as zZeroFunc,
} from "../helpers";
import { Text } from "../elements";
import { isUndefined } from "lodash";
import { Path } from "../../internal_urls";
import { useNavigate } from "react-router";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode, round } from "../../farm_designer/map/util";
import { ThreeElements, ThreeEvent, useFrame, useThree } from
  "@react-three/fiber";
import { getSizeAtTime } from "../../promo/plants";
import { Group, InstancedMesh, MeshBasicMaterial, MeshPhongMaterial } from
  "../components";
import {
  getSpreadOverlap, getSpreadRadii,
} from "../../farm_designer/map/layers/spread/spread_overlap_helper";
import { ActivePositionRef } from "../bed/objects/pointer_objects";
import { Mode } from "../../farm_designer/map/interfaces";
import { findCrop } from "../../crops/find";
import { clearGardenCursor, setGardenCursor } from "../cursor";

export interface ThreeDGardenPlant {
  id?: number | undefined;
  label: string;
  icon: string;
  size: number;
  spread: number;
  x: number;
  y: number;
  key: string;
  seed: number;
}

const noopRaycast = () => null;
const ICON_BRIGHTNESS_FLOOR = 0.3;
const ICON_ALPHA_TEST = 0.1;
const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const getIconBrightness = (sunFactor?: number) => {
  if (sunFactor === undefined) { return 1; }
  const factor = clamp01(sunFactor);
  return ICON_BRIGHTNESS_FLOOR + (1 - ICON_BRIGHTNESS_FLOOR) * factor;
};

export interface ThreeDPlantProps {
  plant: ThreeDGardenPlant;
  i: number;
  labelOnly?: boolean;
  renderImage?: boolean;
  config: Config;
  hoveredPlant: number | undefined;
  disableRaycast?: boolean;
  dispatch?: Function;
  visible?: boolean;
  spreadVisible?: boolean;
  getZ(x: number, y: number): number;
  startTimeRef?: React.RefObject<number>;
  activePositionRef: ActivePositionRef;
  plants: ThreeDGardenPlant[];
  sunFactorRef?: React.RefObject<number>;
}

export const ThreeDPlant = (props: ThreeDPlantProps) => {
  const { i, plant, labelOnly, config, hoveredPlant } = props;
  const renderImage = props.renderImage ?? true;
  const disableRaycast = props.disableRaycast ??
    HOVER_OBJECT_MODES.includes(getMode());
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  const canClick = !disableRaycast
    && !!plant.id
    && !isUndefined(props.dispatch)
    && (props.visible ?? true);
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const billboardRef = React.useRef<GroupType>(null);
  const getPlantZ = React.useCallback((size: number) => {
    const bedX = plant.x - config.bedXOffset;
    const bedY = plant.y - config.bedYOffset;
    return zZeroFunc(config) + props.getZ(bedX, bedY) + size / 2;
  }, [
    config.bedXOffset,
    config.bedYOffset,
    config.columnLength,
    config.zGantryOffset,
    plant.x,
    plant.y,
    props.getZ,
  ]);
  const position = React.useMemo(() => new Vector3(
    threeSpace(plant.x, config.bedLengthOuter),
    threeSpace(plant.y, config.bedWidthOuter),
    getPlantZ(plant.size),
  ), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    getPlantZ,
    plant.size,
    plant.x,
    plant.y,
  ]);
  const handleClick = React.useCallback(() => {
    if (!canClick || !plant.id || isUndefined(props.dispatch)) { return; }
    props.dispatch(setPanelOpen(true));
    navigate(Path.plants(plant.id));
  }, [
    canClick,
    navigate,
    plant.id,
    props.dispatch,
  ]);
  return <Billboard
    ref={billboardRef}
    follow={true}
    position={position}>
    {labelOnly
      ? <LabelPart
        visible={alwaysShowLabels || i === hoveredPlant}
        plant={plant}
        disableRaycast={disableRaycast} />
      : <PlantPart
        i={i}
        config={config}
        plants={props.plants}
        plant={plant}
        renderImage={renderImage}
        billboardRef={billboardRef}
        activePositionRef={props.activePositionRef}
        getPlantZ={getPlantZ}
        url={plant.icon}
        disableRaycast={disableRaycast}
        clickable={canClick}
        spreadVisible={props.spreadVisible || false}
        startTimeRef={props.startTimeRef}
        animateSeasons={props.config.animateSeasons}
        season={config.plants}
        sunFactorRef={props.sunFactorRef}
        onClick={canClick ? handleClick : undefined} />}
  </Billboard>;
};

interface LabelPartProps {
  visible: boolean;
  plant: ThreeDGardenPlant;
  disableRaycast?: boolean;
}

const LabelPart = (props: LabelPartProps) => {
  const position = React.useMemo<[number, number, number]>(
    () => [0, props.plant.size / 2 + 40, 0],
    [props.plant.size],
  );
  return <Text visible={props.visible}
    renderOrder={RenderOrder.plantLabels}
    fontSize={50}
    color={"white"}
    disableRaycast={props.disableRaycast}
    position={position}
    rotation={[0, 0, 0]}>
    {props.plant.label}
  </Text>;
};

interface PlantPartProps extends CustomImageProps {
  spreadVisible: boolean;
  config: Config;
  activePositionRef: ActivePositionRef;
  plants: ThreeDGardenPlant[];
  renderImage?: boolean;
}

const PlantPart = (props: PlantPartProps) => {
  const { config } = props;
  const toRgb = (values: number[]): [number, number, number] => ([
    values[0] || 0,
    values[1] || 0,
    values[2] || 0,
  ]);
  const boundsCenter = React.useMemo(() => getBoundsCenter(config)(), [
    config.columnLength,
    config.zGantryOffset,
  ]);
  const editPlantMode =
    Path.getSlug(Path.designer()) == "plants" && Path.lastChunkIsNum();
  const plantId = parseInt(Path.getSlug(Path.plants()), 10);
  const currentPlant = React.useMemo(() => props.plants.find(p =>
    p.id == plantId,
  ) as ThreeDGardenPlant | undefined, [plantId, props.plants]);
  const halfSize = React.useMemo(() => getHalfSize(config)(), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedWallThickness,
  ]);
  const cropSlug = Path.getCropSlug();
  const cropSpread = React.useMemo(
    () => findCrop(cropSlug).spread,
    [cropSlug],
  );
  const spreadRadii = React.useMemo(() => getSpreadRadii({
    activeDragSpread: editPlantMode ? currentPlant?.spread : cropSpread,
    inactiveSpread: props.plant.spread,
    radius: props.plant.size / 2,
  }), [
    cropSpread,
    currentPlant?.spread,
    editPlantMode,
    props.plant.size,
    props.plant.spread,
  ]);
  const plantXY = React.useMemo(() => ({
    x: round(props.plant.x),
    y: round(props.plant.y),
    z: 0,
  }), [props.plant.x, props.plant.y]);
  const spreadDetailDistances = React.useMemo(() => {
    if (config.lowDetail) { return [0, 0]; }
    const base = Math.max(config.bedLengthOuter, config.bedWidthOuter);
    return [0, base];
  }, [config.bedLengthOuter, config.bedWidthOuter, config.lowDetail]);

  const defaultRgb = React.useMemo<[number, number, number]>(
    () => [0, 1, 0], []);
  const rgb = React.useMemo(() => ({ value: defaultRgb }), [defaultRgb]);
  const lastDynamicSpread = React.useRef(false);
  const offBedPosition = React.useMemo(() => ({ x: -10000, y: -10000 }), []);
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(config),
    [
      config.bedLengthOuter,
      config.bedWidthOuter,
      config.bedXOffset,
      config.bedYOffset,
    ],
  );
  const outsideColor = React.useMemo(() => new Color("red"), []);
  const onBeforeCompile = React.useCallback(
    (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uBoundsCenter = { value: boundsCenter };
      shader.uniforms.uHalfSize = { value: halfSize };
      shader.uniforms.uInside = rgb;
      shader.uniforms.uOutside = { value: outsideColor };
      outOfBoundsShaderModification(shader);
    },
    [boundsCenter, halfSize, outsideColor, rgb],
  );
  useFrame(() => {
    const clickToAddMode = getMode() == Mode.clickToAdd;
    const showSpread = props.spreadVisible;
    const shouldUpdate = showSpread && (clickToAddMode || editPlantMode);
    if (!shouldUpdate) {
      if (lastDynamicSpread.current) {
        rgb.value = defaultRgb;
        lastDynamicSpread.current = false;
      }
      return;
    }
    lastDynamicSpread.current = true;
    const worldPos = props.activePositionRef.current || offBedPosition;
    const activePointer = getGardenPosition(worldPos);
    const active = editPlantMode
      ? {
        x: currentPlant?.x || -10000,
        y: currentPlant?.y || -10000,
      }
      : {
        x: activePointer.x + config.bedXOffset,
        y: activePointer.y + config.bedYOffset,
      };
    const overlap = getSpreadOverlap({
      spreadRadii,
      activeDragXY: {
        x: round(active.x),
        y: round(active.y),
        z: 0,
      },
      plantXY,
    });
    const color: [number, number, number] =
      (props.plant.id && (plantId != props.plant.id))
        ? toRgb(overlap.color.rgb)
        : [1, 1, 1];
    rgb.value = (clickToAddMode || editPlantMode) ? color : defaultRgb;
  });
  const { renderImage, ...imageProps } = props;
  return <Group>
    {renderImage && <Image {...imageProps} />}
    {props.spreadVisible &&
      <Detailed distances={spreadDetailDistances}>
        <Sphere
          args={[spreadRadii.inactive, 32, 32]}
          name={"spread"}
          raycast={() => null}>
          <MeshPhongMaterial
            color={"green"}
            transparent={true}
            opacity={0.4}
            onBeforeCompile={onBeforeCompile}
            depthWrite={false} />
        </Sphere>
        <Sphere
          args={[spreadRadii.inactive, 16, 16]}
          name={"spread"}
          raycast={() => null}>
          <MeshPhongMaterial
            color={"green"}
            transparent={true}
            opacity={0.4}
            onBeforeCompile={onBeforeCompile}
            depthWrite={false} />
        </Sphere>
      </Detailed>}
  </Group>;
};

export const getBoundsCenter = (config: Config) => () =>
  new Vector3(
    0,
    0,
    -10000 + zZero(config),
  );

export const getHalfSize = (config: Config) => () => new Vector3(
  config.bedLengthOuter / 2 - 300,
  config.bedWidthOuter / 2 - config.bedWallThickness,
  10000,
);

export const outOfBoundsShaderModification =
  (shader: WebGLProgramParametersWithUniforms) => {
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vWorldPosition;`,
    ).replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>
       vWorldPosition = worldPosition.xyz;`);
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `#include <common>
       varying vec3 vWorldPosition;
       uniform vec3 uBoundsCenter;
       uniform vec3 uHalfSize;
       uniform vec3 uInside;
       uniform vec3 uOutside;`,
    ).replace(
      "#include <color_fragment>",
      `#include <color_fragment>
       vec3 p = vWorldPosition - uBoundsCenter;
       bool inside =
       p.x > -uHalfSize.x &&
       abs(p.y) <= uHalfSize.y &&
       abs(p.z) <= uHalfSize.z;
       diffuseColor.rgb = mix(uOutside, uInside, float(inside));
      `,
    );
  };

type MeshProps = ThreeElements["mesh"];
interface CustomImageProps extends MeshProps {
  url: string;
  plant: ThreeDGardenPlant;
  i: number;
  onClick?: () => void;
  clickable?: boolean;
  getPlantZ(size: number): number;
  season: string;
  startTimeRef?: React.RefObject<number>;
  animateSeasons: boolean;
  billboardRef: React.RefObject<GroupType | null>;
  disableRaycast?: boolean;
  sunFactorRef?: React.RefObject<number>;
}

const Image = (props: CustomImageProps) => {
  const {
    disableRaycast,
    clickable,
    sunFactorRef,
    ...planeProps
  } = props;
  const texture = useTexture(props.url);

  const { plant } = props;
  // eslint-disable-next-line no-null/no-null
  const imgRef = React.useRef<Mesh>(null);
  // eslint-disable-next-line no-null/no-null
  const materialRef = React.useRef<ThreeMeshBasicMaterial>(null);
  const lastBrightness = React.useRef<number | undefined>(undefined);
  const handlePointerEnter = React.useCallback(() => {
    if (!clickable) { return; }
    setGardenCursor("pointer");
  }, [clickable]);
  const handlePointerLeave = React.useCallback(() => {
    if (!clickable) { return; }
    clearGardenCursor();
  }, [clickable]);

  useFrame(() => {
    const brightness = getIconBrightness(sunFactorRef?.current);
    if (materialRef.current && brightness !== lastBrightness.current) {
      materialRef.current.color.setScalar(brightness);
      lastBrightness.current = brightness;
    }
    if (!props.animateSeasons || !props.startTimeRef) { return; }

    if (imgRef.current && props.billboardRef.current) {
      const currentTime = performance.now() / 1000;
      const t = currentTime - props.startTimeRef.current;
      const scale = plant.size * getSizeAtTime(plant, props.season, t);
      imgRef.current.scale.set(scale, scale, scale);
      props.billboardRef.current.position.z = props.getPlantZ(scale);
    }
  });

  const raycast = disableRaycast ? noopRaycast : Mesh.prototype.raycast;
  return <Plane {...planeProps}
    ref={imgRef}
    scale={(!props.animateSeasons || !props.startTimeRef) ? plant.size : 0}
    name={"" + props.i}
    onClick={props.onClick}
    renderOrder={RenderOrder.plants}
    args={[1, 1]}
    raycast={raycast}
    onPointerEnter={clickable ? handlePointerEnter : undefined}
    onPointerLeave={clickable ? handlePointerLeave : undefined}>
    <MeshBasicMaterial
      ref={materialRef}
      key={Math.random()}
      map={texture}
      alphaTest={ICON_ALPHA_TEST}
      transparent={true} />
  </Plane>;
};

interface PlantImageInstance {
  plant: ThreeDGardenPlant;
  position: [number, number, number];
}

interface PlantImageGroup {
  icon: string;
  instances: PlantImageInstance[];
  indices: number[];
}

export interface PlantImageInstancesProps {
  plants: ThreeDGardenPlant[];
  config: Config;
  getZ(x: number, y: number): number;
  visible?: boolean;
  dispatch?: Function;
  disableRaycast?: boolean;
  season: string;
  startTimeRef?: React.RefObject<number>;
  animateSeasons: boolean;
  sunFactorRef?: React.RefObject<number>;
}

const buildPlantImageGroups = (
  plants: ThreeDGardenPlant[],
  config: Config,
  getZ: (x: number, y: number) => number,
): PlantImageGroup[] => {
  const groups = new Map<string, PlantImageGroup>();
  const baseZOffset = zZeroFunc(config);
  plants.forEach((plant, index) => {
    const group = groups.get(plant.icon) || {
      icon: plant.icon,
      instances: [],
      indices: [],
    };
    const bedX = plant.x - config.bedXOffset;
    const bedY = plant.y - config.bedYOffset;
    const baseZ = baseZOffset + getZ(bedX, bedY);
    group.instances.push({
      plant,
      position: [
        threeSpace(plant.x, config.bedLengthOuter),
        threeSpace(plant.y, config.bedWidthOuter),
        baseZ,
      ],
    });
    group.indices.push(index);
    groups.set(plant.icon, group);
  });
  return Array.from(groups.values());
};

interface PlantImageGroupProps extends PlantImageInstancesProps {
  group: PlantImageGroup;
}

const PlantImageGroup = (props: PlantImageGroupProps) => {
  const { group } = props;
  const { camera } = useThree();
  const navigate = useNavigate();
  const disableRaycast = props.disableRaycast ??
    HOVER_OBJECT_MODES.includes(getMode());
  const isVisible = props.visible ?? true;
  const canClick = !disableRaycast
    && !isUndefined(props.dispatch)
    && isVisible;
  const texture = useTexture(group.icon);
  const geometry = React.useMemo(() => new PlaneGeometry(1, 1), []);
  const material = React.useMemo(() => {
    const nextMaterial = new ThreeMeshBasicMaterial({
      map: texture,
      alphaTest: ICON_ALPHA_TEST,
      transparent: true,
    });
    nextMaterial.color.setScalar(
      getIconBrightness(props.sunFactorRef?.current),
    );
    return nextMaterial;
  }, [props.sunFactorRef, texture]);
  React.useEffect(() => () => geometry.dispose(), [geometry]);
  React.useEffect(() => () => material.dispose(), [material]);
  // eslint-disable-next-line no-null/no-null
  const meshRef = React.useRef<ThreeInstancedMesh>(null);
  const dummy = React.useMemo(() => new Object3D(), []);
  const lastCameraQuat = React.useRef(new Quaternion());
  const lastBrightness = React.useRef<number | undefined>(undefined);
  const updateInstances = React.useCallback((time?: number) => {
    const mesh = meshRef.current;
    if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
    const startTime = props.startTimeRef?.current;
    const animate = props.animateSeasons && !isUndefined(startTime);
    dummy.quaternion.copy(camera.quaternion);
    group.instances.forEach((data, instanceIndex) => {
      const scale = animate
        ? (typeof time === "number"
          ? data.plant.size * getSizeAtTime(data.plant, props.season, time)
          : 0)
        : data.plant.size;
      const z = data.position[2] + scale / 2;
      dummy.position.set(data.position[0], data.position[1], z);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(instanceIndex, dummy.matrix);
    });
    if ("count" in mesh) {
      mesh.count = group.instances.length;
    }
    if (mesh.instanceMatrix) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [
    camera.quaternion,
    dummy,
    group.instances,
    props.animateSeasons,
    props.season,
    props.startTimeRef,
  ]);
  React.useLayoutEffect(() => {
    updateInstances();
    lastCameraQuat.current.copy(camera.quaternion);
    const mesh = meshRef.current;
    if (mesh) {
      mesh.userData = mesh.userData || {};
      mesh.userData.instancePlantIndices = group.indices;
    }
  }, [camera.quaternion, group.indices, updateInstances]);
  useFrame(() => {
    const startTime = props.startTimeRef?.current;
    const animate = props.animateSeasons && !isUndefined(startTime);
    const cameraMoved = !lastCameraQuat.current.equals(camera.quaternion);
    if (!animate && !cameraMoved) { return; }
    const currentTime = performance.now() / 1000;
    const t = animate ? currentTime - (startTime ?? 0) : undefined;
    updateInstances(t);
    lastCameraQuat.current.copy(camera.quaternion);
  });
  useFrame(() => {
    const brightness = getIconBrightness(props.sunFactorRef?.current);
    if (brightness !== lastBrightness.current) {
      material.color.setScalar(brightness);
      lastBrightness.current = brightness;
    }
  });
  const handleClick = React.useCallback((e: ThreeEvent<MouseEvent>) => {
    if (isUndefined(e.instanceId)) { return; }
    const data = group.instances[e.instanceId];
    const plant = data?.plant;
    if (!plant) { return; }
    if (plant.id
      && !isUndefined(props.dispatch)
      && props.visible
      && !HOVER_OBJECT_MODES.includes(getMode())) {
      props.dispatch(setPanelOpen(true));
      navigate(Path.plants(plant.id));
    }
  }, [
    group.instances,
    navigate,
    props.dispatch,
    props.visible,
  ]);
  const handlePointerEnter = React.useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!canClick || isUndefined(e.instanceId)) { return; }
      const plant = group.instances[e.instanceId]?.plant;
      if (!plant?.id) { return; }
      setGardenCursor("pointer");
    },
    [canClick, group.instances],
  );
  const handlePointerLeave = React.useCallback(() => {
    if (!canClick) { return; }
    clearGardenCursor();
  }, [canClick]);
  if (group.instances.length === 0) { return null; }
  const raycast = disableRaycast
    ? noopRaycast
    : ThreeInstancedMesh.prototype.raycast;
  const onClick = disableRaycast ? undefined : handleClick;
  return <InstancedMesh
    ref={meshRef}
    args={[geometry, material, group.instances.length]}
    name={"plant-instances-" + group.icon}
    renderOrder={RenderOrder.plants}
    visible={props.visible}
    raycast={raycast}
    onClick={onClick}
    onPointerEnter={canClick ? handlePointerEnter : undefined}
    onPointerLeave={canClick ? handlePointerLeave : undefined} />;
};

export const PlantImageInstances = React.memo(
  (props: PlantImageInstancesProps) => {
    const groups = React.useMemo(
      () => buildPlantImageGroups(props.plants, props.config, props.getZ),
      [
        props.config.bedLengthOuter,
        props.config.bedWidthOuter,
        props.config.bedXOffset,
        props.config.bedYOffset,
        props.config.columnLength,
        props.config.zGantryOffset,
        props.getZ,
        props.plants,
      ],
    );
    if (groups.length === 0) { return null; }
    return <>
      {groups.map(group =>
        <PlantImageGroup key={group.icon} group={group} {...props} />)}
    </>;
  },
);
