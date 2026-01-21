import React from "react";
import * as THREE from "three";
import { Billboard, useGLTF } from "@react-three/drei";
import { threeSpace, zDir as zDirFunc, zZero as zZeroFunc } from "../../helpers";
import { Config } from "../../config";
import { GLTF } from "three-stdlib";
import {
  ASSETS,
  HOVER_OBJECT_MODES,
  LIB_DIR,
  PartName,
  RenderOrder,
  SeedTroughAssemblyMaterial,
} from "../../constants";
import {
  SoilSensor, SoilSensorFull,
  SeedTroughAssembly, SeedTroughAssemblyFull,
  SeedTroughHolder, SeedTroughHolderFull,
} from "../parts";
import { Group, InstancedMesh, Mesh, MeshPhongMaterial } from "../../components";
import { distinguishableBlack, utmHeight } from "../bot";
import { SlotWithTool } from "../../../resources/interfaces";
import { isUndefined, sortBy, startCase } from "lodash";
import {
  reduceToolName, ToolName,
} from "../../../farm_designer/map/tool_graphics/all_tools";
import { Xyz } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { useNavigate } from "react-router";
import { Path } from "../../../internal_urls";
import { setPanelOpen } from "../../../farm_designer/panel_header";
import { getMode } from "../../../farm_designer/map/util";
import { PROMO_TOOLS } from "../../../promo/tools";
import { useFrame } from "@react-three/fiber";
import { Model, ModelMesh } from "../../model_mesh";
import { SuctionAnimation } from "./suction_animation";
import { clearGardenCursor, setGardenCursor } from "../../cursor";
import { Text } from "../../elements";

type Toolbay3 = GLTF & {
  nodes: {
    [PartName.toolbay3]: THREE.Mesh;
    [PartName.toolbay3Logo]: THREE.Mesh;
  };
  materials: never;
}
type Toolbay1 = GLTF & {
  nodes: {
    [PartName.toolbay1]: THREE.Mesh;
    [PartName.toolbay1Logo]: THREE.Mesh;
  };
  materials: never;
}
type WateringNozzle = GLTF & {
  nodes: { [PartName.wateringNozzle]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type SeedBin = GLTF & {
  nodes: { [PartName.seedBin]: THREE.Mesh };
  materials: never;
}
type SeedTray = GLTF & {
  nodes: { [PartName.seedTray]: THREE.Mesh };
  materials: never;
}
type SeedTrough = GLTF & {
  nodes: { [PartName.seedTrough]: THREE.Mesh };
  materials: { [SeedTroughAssemblyMaterial.two]: THREE.MeshStandardMaterial };
}
type Seeder = GLTF & {
  nodes: { [PartName.seeder]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type Weeder = GLTF & {
  nodes: { [PartName.weeder]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

const TOOL_X = 5.5;
const ROTARY_TOOL_POSITION: [number, number, number] = [TOOL_X, 0, 10];
const ROTARY_TOOL_IMPLEMENT_POSITION: [number, number, number] = [0, -3, -52];
const ROTARY_TOOL_IMPLEMENT_ROTATION: [number, number, number] = [
  -10 * Math.PI / 180, 0, 0,
];
const WATERING_NOZZLE_POSITION: [number, number, number] = [13, 10.5, 15];
const SEED_BIN_POSITION: [number, number, number] = [TOOL_X, 0, -4];
const SEED_TRAY_POSITION: [number, number, number] = [TOOL_X, 0, -4];
const SOIL_SENSOR_POSITION: [number, number, number] = [TOOL_X, 0, 10];
const SEEDER_POSITION: [number, number, number] = [TOOL_X, 0, -5];
const SEEDER_SUCTION_POSITION: [number, number, number] = [20, 0, -30];
const WEEDER_POSITION: [number, number, number] = [TOOL_X - 25, 20, 10];
const SEED_TROUGH_ASSEMBLY_POSITION: [number, number, number] = [3, -15, 30];
const SEED_TROUGH_POSITION: [number, number, number] = [15, -15, 30];
const TOOLBAY_ROTATION: [number, number, number] = [0, 0, Math.PI / 2];
const SUCTION_ZS = [-50, -80, -95, -100];
const TOOLBAY3_PARTS = [
  { node: PartName.toolbay3, color: distinguishableBlack, id: "toolbay3" },
  { node: PartName.toolbay3Logo, color: "white", id: "toolbay3Logo" },
];
const TOOLBAY3_ROTATION: [number, number, number] = [0, 0, -Math.PI / 2];
const TOOL_LABEL_OFFSET = 120;
const TOOL_LABEL_FONT_SIZE = 40;

const formatToolLabel = (label?: string, toolName?: string) => {
  if (label) { return label; }
  return startCase(toolName || "tool");
};

interface Toolbay3PartInstancesProps {
  geometry: THREE.BufferGeometry;
  name: string;
  positions: [number, number, number][];
  material?: THREE.Material | THREE.Material[];
  color: THREE.ColorRepresentation;
}

const cloneMaterial = (
  material: THREE.Material | THREE.Material[],
): THREE.Material | THREE.Material[] =>
  Array.isArray(material)
    ? material.map(mat => mat.clone())
    : material.clone();

const disposeMaterial = (material: THREE.Material | THREE.Material[]) => {
  if (Array.isArray(material)) {
    material.forEach(mat => mat.dispose());
    return;
  }
  material.dispose();
};

const Toolbay3PartInstances = React.memo((props: Toolbay3PartInstancesProps) => {
  const material = React.useMemo(() => {
    if (props.material) {
      return cloneMaterial(props.material);
    }
    return new THREE.MeshPhongMaterial({ color: props.color });
  }, [props.color, props.material]);
  React.useEffect(() => () => disposeMaterial(material), [material]);
  // eslint-disable-next-line no-null/no-null
  const meshRef = React.useRef<THREE.InstancedMesh>(null);
  const dummy = React.useMemo(() => new THREE.Object3D(), []);
  React.useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || typeof mesh.setMatrixAt !== "function") { return; }
    props.positions.forEach((position, index) => {
      dummy.position.set(...position);
      dummy.rotation.set(...TOOLBAY3_ROTATION);
      dummy.scale.set(1000, 1000, 1000);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    if ("count" in mesh) {
      mesh.count = props.positions.length;
    }
    if (mesh.instanceMatrix) {
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [dummy, props.positions]);
  if (props.positions.length === 0) { return null; }
  return <InstancedMesh
    ref={meshRef}
    name={props.name}
    args={[props.geometry, material, props.positions.length]}
    raycast={() => undefined} />;
});

export interface ToolsProps {
  config: Config;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
  getZ(x: number, y: number): number;
}

export interface ThreeDTool {
  id?: number | undefined;
  x: number;
  y: number;
  z: number;
  toolName: string | undefined;
  label?: string;
  toolPulloutDirection: ToolPulloutDirection;
  firstTrough?: boolean;
  gantryMounted?: boolean;
}

const rotationFactor = (toolPulloutDirection: ToolPulloutDirection) => {
  switch (toolPulloutDirection) {
    case ToolPulloutDirection.POSITIVE_X: return 3;
    case ToolPulloutDirection.POSITIVE_Y: return 4;
    case ToolPulloutDirection.NEGATIVE_X: return 1;
    case ToolPulloutDirection.NEGATIVE_Y: return 2;
  }
};

export const convertSlotsWithTools =
  (slotsWithTools: SlotWithTool[]): ThreeDTool[] => {
    let troughIndex = 0;
    return sortBy(slotsWithTools, "toolSlot.body.y").map(swt => {
      const toolName = reduceToolName(swt.tool?.body.name);
      const label = swt.tool?.body.name || "Empty";
      if (toolName == ToolName.seedTrough) { troughIndex++; }
      return {
        id: swt.toolSlot.body.id,
        x: swt.toolSlot.body.x,
        y: swt.toolSlot.body.y,
        z: swt.toolSlot.body.z,
        toolName,
        label,
        toolPulloutDirection: swt.toolSlot.body.pullout_direction,
        firstTrough: troughIndex < 2,
        gantryMounted: swt.toolSlot.body.gantry_mounted,
      };
    });
  };

export const Tools = React.memo((props: ToolsProps) => {
  const {
    bedXOffset, bedYOffset, bedLengthOuter, bedWidthOuter, bedWallThickness,
  } = props.config;
  const showHoverLabels =
    props.config.labels && props.config.labelsOnHover;
  const toX = React.useCallback((value: number) =>
    threeSpace(value, bedLengthOuter) + bedXOffset,
  [bedLengthOuter, bedXOffset]);
  const toY = React.useCallback((value: number) =>
    threeSpace(value, bedWidthOuter) + bedYOffset,
  [bedWidthOuter, bedYOffset]);
  const botPosition = React.useMemo(() => ({
    x: props.config.x,
    y: props.config.y,
    z: props.config.z,
  }), [props.config.x, props.config.y, props.config.z]);
  const mountedToolName = React.useMemo(() => isUndefined(props.toolSlots)
    ? props.config.tool
    : reduceToolName(props.mountedToolName),
  [props.toolSlots, props.config.tool, props.mountedToolName]);
  const mountedToolLabel = React.useMemo(
    () => formatToolLabel(props.mountedToolName, mountedToolName),
    [mountedToolName, props.mountedToolName],
  );
  const zZero = React.useMemo(() => zZeroFunc(props.config), [props.config]);
  const zDir = React.useMemo(() => zDirFunc(props.config), [props.config]);
  const toolbay3YPositions = React.useMemo(
    () => (props.config.sizePreset == "Jr" ? [0] : [-200, 200]),
    [props.config.sizePreset],
  );
  const toolbay3X = React.useMemo(
    () => threeSpace(105 + bedWallThickness, bedLengthOuter),
    [bedWallThickness, bedLengthOuter],
  );
  const toolbay3Positions = React.useMemo(() => (
    toolbay3YPositions.map(yPosition => ([
      toolbay3X,
      threeSpace(yPosition + bedWidthOuter / 2, bedWidthOuter),
      50,
    ] as [number, number, number]))
  ), [bedWidthOuter, toolbay3X, toolbay3YPositions]);

  const toolbay3 = useGLTF(ASSETS.models.toolbay3, LIB_DIR) as Toolbay3;
  const toolbay1 = useGLTF(ASSETS.models.toolbay1, LIB_DIR) as Toolbay1;
  const rotaryToolBase =
    useGLTF(ASSETS.models.rotaryToolBase, LIB_DIR) as Model;
  const rotaryToolImplement =
    useGLTF(ASSETS.models.rotaryToolImplement, LIB_DIR) as Model;
  const seedBin = useGLTF(ASSETS.models.seedBin, LIB_DIR) as SeedBin;
  const seedTray = useGLTF(ASSETS.models.seedTray, LIB_DIR) as SeedTray;
  const seedTrough = useGLTF(ASSETS.models.seedTrough, LIB_DIR) as SeedTrough;
  const seedTroughHolder = useGLTF(
    ASSETS.models.seedTroughHolder, LIB_DIR) as SeedTroughHolderFull;
  const SeedTroughHolderComponent = SeedTroughHolder(seedTroughHolder);
  const seedTroughAssembly = useGLTF(
    ASSETS.models.seedTroughAssembly, LIB_DIR) as SeedTroughAssemblyFull;
  const SeedTroughAssemblyComponent = SeedTroughAssembly(seedTroughAssembly);
  const soilSensor = useGLTF(ASSETS.models.soilSensor, LIB_DIR) as SoilSensorFull;
  const seeder = useGLTF(ASSETS.models.seeder, LIB_DIR) as Seeder;
  const weeder = useGLTF(ASSETS.models.weeder, LIB_DIR) as Weeder;
  const SoilSensorComponent = SoilSensor(soilSensor);
  const wateringNozzle = useGLTF(
    ASSETS.models.wateringNozzle, LIB_DIR) as WateringNozzle;

  interface ToolbaySlotProps {
    position: Record<Xyz, number>;
    children?: React.ReactNode;
    toolPulloutDirection: ToolPulloutDirection;
    mounted: boolean;
    id: number | undefined;
    inToolbay: boolean;
    label?: string;
  }

  const ToolbaySlot = (slotProps: ToolbaySlotProps) => {
    const { position, children, toolPulloutDirection, mounted } = slotProps;
    const rotationMultiplier = React.useMemo(
      () => rotationFactor(toolPulloutDirection), [toolPulloutDirection]);
    const navigate = useNavigate();
    const label = slotProps.label;
    const labelPosition = React.useMemo<[number, number, number]>(
      () => [0, 0, TOOL_LABEL_OFFSET],
      [],
    );
    const [showLabel, setShowLabel] = React.useState(false);
    const slotPosition = React.useMemo<[number, number, number]>(() => ([
      position.x + 5,
      position.y,
      position.z - 9,
    ]), [position.x, position.y, position.z]);
    const bayRotation = React.useMemo<[number, number, number]>(() => ([
      0,
      0,
      (rotationMultiplier ?? 0) * Math.PI / 2,
    ]), [rotationMultiplier]);
    const canClick = !!slotProps.id
      && !isUndefined(props.dispatch)
      && !HOVER_OBJECT_MODES.includes(getMode());
    const enableHover = canClick || showHoverLabels;
    React.useEffect(() => {
      if (showHoverLabels && label) { return; }
      setShowLabel(false);
    }, [label, showHoverLabels]);
    const handleClick = React.useCallback(() => {
      if (!canClick || !slotProps.id || isUndefined(props.dispatch)) { return; }
      props.dispatch(setPanelOpen(true));
      navigate(Path.toolSlots(slotProps.id));
    }, [canClick, navigate, props.dispatch, slotProps.id]);
    const handlePointerEnter = React.useCallback(() => {
      if (showHoverLabels && label) { setShowLabel(true); }
      if (canClick) { setGardenCursor("pointer"); }
    }, [canClick, label, showHoverLabels]);
    const handlePointerLeave = React.useCallback(() => {
      if (showHoverLabels && label) { setShowLabel(false); }
      if (canClick) { clearGardenCursor(); }
    }, [canClick, label, showHoverLabels]);
    return <Group name={slotProps.inToolbay ? "slot" : "utm-tool"}
      position={slotPosition}
      onClick={canClick ? handleClick : undefined}
      onPointerEnter={enableHover ? handlePointerEnter : undefined}
      onPointerLeave={enableHover ? handlePointerLeave : undefined}>
      {rotationMultiplier &&
        <Group name={"bay"}
          rotation={bayRotation}>
          <Mesh name={"toolbay1"}
            scale={1000}
            geometry={toolbay1.nodes[PartName.toolbay1].geometry}>
            <MeshPhongMaterial color={distinguishableBlack} />
          </Mesh>
          <Mesh name={"toolbay1-logo"}
            scale={1000}
            geometry={toolbay1.nodes[PartName.toolbay1Logo].geometry}>
            <MeshPhongMaterial color={distinguishableBlack} />
          </Mesh>
        </Group>}
      <OpacityFilter opacity={mounted ? 0.25 : 1}>
        {children}
      </OpacityFilter>
      {showHoverLabels && showLabel && label &&
        <Billboard
          name={"tool-label"}
          follow={true}
          position={labelPosition}>
          <Text
            renderOrder={RenderOrder.plantLabels}
            fontSize={TOOL_LABEL_FONT_SIZE}
            color={"white"}
            disableRaycast={true}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}>
            {label}
          </Text>
        </Billboard>}
    </Group>;
  };

  interface ToolProps extends ThreeDTool {
    inToolbay: boolean;
  }

  // eslint-disable-next-line complexity
  const Tool = (toolProps: ToolProps) => {
    const { toolPulloutDirection, inToolbay, id } = toolProps;
    const mounted = inToolbay && toolProps.toolName == mountedToolName;
    const position = React.useMemo(() => ({
      x: toX(toolProps.x),
      y: toY(toolProps.y),
      z: zZero - zDir * toolProps.z + (inToolbay ? 0 : (utmHeight / 2 - 15)),
    }), [
      inToolbay,
      toolProps.x,
      toolProps.y,
      toolProps.z,
      toX,
      toY,
      zDir,
      zZero,
    ]);
    const label = formatToolLabel(toolProps.label, toolProps.toolName);
    const common: ToolbaySlotProps = {
      mounted,
      position,
      toolPulloutDirection,
      id,
      inToolbay,
      label,
    };
    const slotPosition = React.useMemo<[number, number, number]>(
      () => [position.x + 5, position.y, position.z - 9],
      [position.x, position.y, position.z],
    );
    const seedTroughRootPosition = React.useMemo<[number, number, number]>(
      () => [position.x - 30, position.y - 15, position.z - 40],
      [position.x, position.y, position.z],
    );
    const seedTroughRootOffset = React.useMemo<[number, number, number]>(
      () => [
        seedTroughRootPosition[0] - slotPosition[0],
        seedTroughRootPosition[1] - slotPosition[1],
        seedTroughRootPosition[2] - slotPosition[2],
      ],
      [seedTroughRootPosition, slotPosition],
    );

    // eslint-disable-next-line no-null/no-null
    const rotaryToolImplementRef = React.useRef<THREE.Mesh>(null);

    const rotarySpeed = React.useMemo(
      () => (props.config.rotary > 0 ? 0.01 : -0.01),
      [props.config.rotary],
    );
    useFrame(() => {
      if (rotaryToolImplementRef.current && !inToolbay && props.config.rotary) {
        const time = Date.now();
        rotaryToolImplementRef.current.rotation.z = time * rotarySpeed;
      }
    });
    switch (toolProps.toolName) {
      case ToolName.rotaryTool:
        return <ToolbaySlot {...common}>
          <Group name={"rotaryTool"}
            position={ROTARY_TOOL_POSITION}
            rotation={TOOLBAY_ROTATION}>
            <ModelMesh name={"rotaryToolBase"}
              model={rotaryToolBase} />
            <Group
              position={ROTARY_TOOL_IMPLEMENT_POSITION}
              rotation={ROTARY_TOOL_IMPLEMENT_ROTATION}>
              <ModelMesh name={"rotaryToolImplement"}
                ref={rotaryToolImplementRef}
                model={rotaryToolImplement} />
            </Group>
          </Group>
        </ToolbaySlot>;
      case ToolName.wateringNozzle:
        return <ToolbaySlot {...common}>
          <Mesh name={"wateringNozzle"}
            position={WATERING_NOZZLE_POSITION}
            rotation={[0, 0, 2.094 + Math.PI / 2]}
            scale={1000}
            geometry={wateringNozzle.nodes[PartName.wateringNozzle].geometry}
            material={wateringNozzle.materials.PaletteMaterial001} />
        </ToolbaySlot>;
      case ToolName.seedBin:
        return <ToolbaySlot {...common}>
          <Mesh name={"seedBin"}
            position={SEED_BIN_POSITION}
            rotation={TOOLBAY_ROTATION}
            scale={1000}
            geometry={seedBin.nodes[PartName.seedBin].geometry}>
            <MeshPhongMaterial color={"silver"} />
          </Mesh>
        </ToolbaySlot>;
      case ToolName.seedTray:
        return <ToolbaySlot {...common}>
          <Mesh name={"seedTray"}
            position={SEED_TRAY_POSITION}
            rotation={TOOLBAY_ROTATION}
            scale={1000}
            geometry={seedTray.nodes[PartName.seedTray].geometry}>
            <MeshPhongMaterial color={"silver"} />
          </Mesh>
        </ToolbaySlot>;
      case ToolName.soilSensor:
        return <ToolbaySlot {...common}>
          <SoilSensorComponent name={"soilSensor"}
            position={SOIL_SENSOR_POSITION}
            rotation={TOOLBAY_ROTATION}
            scale={1000} />
        </ToolbaySlot>;
      case ToolName.seeder:
        return <ToolbaySlot {...common}>
          <Mesh name={"seeder"}
            position={SEEDER_POSITION}
            rotation={TOOLBAY_ROTATION}
            scale={1000}
            geometry={seeder.nodes[PartName.seeder].geometry}
            material={seeder.materials.PaletteMaterial001} />
          {!inToolbay && props.config.vacuum &&
            <Group position={SEEDER_SUCTION_POSITION}>
              {SUCTION_ZS.map(z =>
                <SuctionAnimation key={z} z={z} />)}
            </Group>}
        </ToolbaySlot>;
      case ToolName.weeder:
        return <ToolbaySlot {...common}>
          <Mesh name={"weeder"}
            position={WEEDER_POSITION}
            rotation={[0, 0, -Math.PI]}
            scale={1000}
            geometry={weeder.nodes[PartName.weeder].geometry}
            material={weeder.materials.PaletteMaterial001} />
        </ToolbaySlot>;
      case ToolName.seedTrough:
        return <ToolbaySlot {...common}>
          <Group
            position={seedTroughRootOffset}
            rotation={TOOLBAY_ROTATION}>
            {toolProps.firstTrough
              ? <Group name={"seedTroughWithAssembly"}>
                <SeedTroughAssemblyComponent name={"seedTroughAssembly"}
                  position={SEED_TROUGH_ASSEMBLY_POSITION}
                  scale={1000} />
                <SeedTroughHolderComponent name={"seedTroughHolder"}
                  scale={1000} />
              </Group>
              : <Mesh name={"seedTrough"}
                position={SEED_TROUGH_POSITION}
                scale={1000}
                geometry={seedTrough.nodes[PartName.seedTrough].geometry}
                material={
                  seedTrough.materials[SeedTroughAssemblyMaterial.two]
                } />}
          </Group>
        </ToolbaySlot>;
      default:
        return <ToolbaySlot {...common} />;
    }
  };

  const tools = React.useMemo(() => isUndefined(props.toolSlots)
    ? PROMO_TOOLS(props.config)
    : convertSlotsWithTools(props.toolSlots),
  [props.config, props.toolSlots]);

  return <Group name={"tools"}>
    <Tool
      x={botPosition.x}
      y={botPosition.y}
      z={botPosition.z + (isUndefined(props.toolSlots) ? 1 : -2)}
      toolName={mountedToolName}
      label={mountedToolLabel}
      toolPulloutDirection={ToolPulloutDirection.NONE}
      inToolbay={false} />
    {isUndefined(props.toolSlots) &&
      <Group name={"toolbay3"}>
        {TOOLBAY3_PARTS.map(part => {
          const node =
            toolbay3.nodes[part.node as keyof Toolbay3["nodes"]];
          return <Toolbay3PartInstances
            key={part.id}
            name={part.id}
            positions={toolbay3Positions}
            color={part.color}
            geometry={node.geometry}
            material={node.material} />;
        })}
      </Group>}
    {tools.map((tool, i) =>
      <Tool key={i}
        {...tool}
        x={tool.gantryMounted ? botPosition.x : tool.x}
        inToolbay={true} />)}
  </Group>;
});

interface OpacityFilterProps {
  opacity: number;
  children?: React.ReactNode;
}

const OpacityFilter = (props: OpacityFilterProps) => {
  // eslint-disable-next-line no-null/no-null
  const groupRef = React.useRef<THREE.Group>(null);
  React.useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = props.opacity;
          child.material.needsUpdate = true;
        }
      });
    }
  }, [props.opacity]);
  return <Group ref={groupRef}>{props.children}</Group>;
};
