import React from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import { threeSpace } from "../../helpers";
import { Config, PositionConfig } from "../../config";
import type { GLTF } from "three-stdlib";
import {
  ASSETS, HOVER_OBJECT_MODES, LIB_DIR, PartName, RenderOrder,
  SeedTroughAssemblyMaterial,
} from "../../constants";
import {
  SoilSensorFull, SoilSensorModel,
  SeedTroughAssemblyFull, SeedTroughAssemblyModel,
  SeedTroughHolderFull, SeedTroughHolderModel,
} from "../parts";
import {
  Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, PlaneGeometry,
} from "../../components";
import { SlotWithTool } from "../../../resources/interfaces";
import { isUndefined, sortBy } from "lodash";
import {
  reduceToolName, ToolName,
} from "../../../farm_designer/map/tool_graphics/all_tools";
import { Xyz } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { useNavigate } from "react-router";
import { Path } from "../../../internal_urls";
import { setPanelOpen3D } from "../../panel_actions";
import { getMode } from "../../../farm_designer/map/util";
import { Mode } from "../../../farm_designer/map/interfaces";
import { PROMO_TOOLS } from "../../../promo/tools";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Model, ModelMesh } from "../../model_mesh";
import { SuctionAnimations } from "./suction_animation";
import {
  ThreeDObjectHoverHandler, ThreeDObjectHoverLabelHandler,
  ThreeDObjectSelection,
  ThreeDObjectSelectionHandler,
} from "../../selection_types";
import {
  getToolPositionHelpers, getToolRenderPosition, ToolPositionHelpers,
} from "./tool_slot_position";
import { clickWasDragged } from "../../click_event";

const distinguishableBlack = "#333";

type Toolbay3 = GLTF & {
  nodes: {
    [PartName.toolbay3]: THREE.Mesh;
    [PartName.toolbay3Logo]: THREE.Mesh;
  };
  materials: never;
}
type Toolbay5 = GLTF & {
  nodes: {
    [PartName.toolbay5]: THREE.Mesh;
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

export interface ToolsProps {
  config: Config;
  configPosition: PositionConfig;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
  getZ(x: number, y: number): number;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onToolSlotHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
}

export interface ThreeDTool {
  id?: number | undefined;
  x: number;
  y: number;
  z: number;
  toolName: string | undefined;
  toolPulloutDirection: ToolPulloutDirection;
  firstTrough?: boolean;
  gantryMounted?: boolean;
}

const TOOLS_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWallThickness",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeX",
  "columnLength",
  "kitVersion",
  "mirrorX",
  "mirrorY",
  "negativeZ",
  "rotary",
  "sizePreset",
  "tool",
  "vacuum",
  "zGantryOffset",
];

export const toolsPropsEqual = (prev: ToolsProps, next: ToolsProps) =>
  prev.toolSlots === next.toolSlots &&
  prev.mountedToolName === next.mountedToolName &&
  prev.dispatch === next.dispatch &&
  prev.getZ === next.getZ &&
  prev.onSelectObject === next.onSelectObject &&
  prev.onHoverObject === next.onHoverObject &&
  prev.onToolSlotHoverObject === next.onToolSlotHoverObject &&
  prev.onHoverLabel === next.onHoverLabel &&
  prev.configPosition.x === next.configPosition.x &&
  prev.configPosition.y === next.configPosition.y &&
  prev.configPosition.z === next.configPosition.z &&
  TOOLS_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const convertSlotsWithTools =
  (slotsWithTools: SlotWithTool[]): ThreeDTool[] => {
    let troughIndex = 0;
    return sortBy(slotsWithTools, "toolSlot.body.y").map(swt => {
      const toolName = reduceToolName(swt.tool?.body.name);
      if (toolName == ToolName.seedTrough) { troughIndex++; }
      return {
        id: swt.toolSlot.body.id,
        x: swt.toolSlot.body.x,
        y: swt.toolSlot.body.y,
        z: swt.toolSlot.body.z,
        toolName,
        toolPulloutDirection: swt.toolSlot.body.pullout_direction,
        firstTrough: troughIndex < 2,
        gantryMounted: swt.toolSlot.body.gantry_mounted,
      };
    });
  };

interface PromoToolbay3Props {
  config: Config;
}

const PromoToolbay3 = (props: PromoToolbay3Props) => {
  const {
    bedLengthOuter, bedWidthOuter, bedWallThickness,
  } = props.config;
  const toolbay3 = useGLTF(ASSETS.models.toolbay3, LIB_DIR) as unknown as Toolbay3;
  return <Group name={"toolbay3"}>
    {((props.config.sizePreset == "Jr") ? [0] : [-200, 200]).map(yPosition =>
      <Group key={yPosition}>
        {[
          { node: PartName.toolbay3, color: distinguishableBlack, id: "toolbay3" },
          { node: PartName.toolbay3Logo, color: "white", id: "toolbay3Logo" },
        ].map(part =>
          <Mesh name={part.id} key={part.id}
            position={[
              threeSpace(105 + bedWallThickness, bedLengthOuter),
              threeSpace(yPosition + bedWidthOuter / 2, bedWidthOuter),
              50,
            ]}
            rotation={[0, 0, -Math.PI / 2]}
            scale={1000}
            geometry={
              toolbay3.nodes[part.node as keyof Toolbay3["nodes"]].geometry}>
            <MeshPhongMaterial color={part.color} />
          </Mesh>)}
      </Group>)}
  </Group>;
};

const PromoToolbay5 = (props: PromoToolbay3Props) => {
  const {
    bedLengthOuter, bedWidthOuter, bedWallThickness,
  } = props.config;
  const toolbay5 = useGLTF(ASSETS.models.toolbay5, LIB_DIR) as unknown as Toolbay5;
  const logoTexture = useTexture(ASSETS.other.farmbotLogo);
  return <Group name={"toolbay5"}
    position={[
      threeSpace(105 + bedWallThickness, bedLengthOuter),
      threeSpace(bedWidthOuter / 2, bedWidthOuter),
      50,
    ]}
    rotation={[0, 0, -Math.PI / 2]}>
    <Mesh name={"toolbay5"}
      scale={1000}
      geometry={toolbay5.nodes[PartName.toolbay5].geometry}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Mesh>
    <Mesh name={"toolbay5Logo"}
      position={[0, -66, -20]}
      rotation={[Math.PI / 4, 0, 0]}
      renderOrder={RenderOrder.plantLabels}
      raycast={() => undefined}>
      <PlaneGeometry args={[77, 77 * 274 / 595]} />
      <MeshBasicMaterial
        map={logoTexture}
        transparent={true}
        alphaTest={0.1}
        depthWrite={false}
        toneMapped={false}
        side={THREE.DoubleSide} />
    </Mesh>
  </Group>;
};

const ToolsBase = (props: ToolsProps) => {
  const mirroredBotX = props.config.mirrorX
    ? props.config.botSizeX - props.configPosition.x
    : props.configPosition.x;
  const mountedToolName = isUndefined(props.toolSlots)
    ? props.config.tool
    : reduceToolName(props.mountedToolName);

  const configuredTools = React.useMemo(
    () => isUndefined(props.toolSlots)
      ? undefined
      : convertSlotsWithTools(props.toolSlots),
    [props.toolSlots]);
  const tools = isUndefined(configuredTools)
    ? PROMO_TOOLS(props.config, props.configPosition)
    : configuredTools;
  const positionHelpers =
    React.useMemo(() => getToolPositionHelpers(props.config), [props.config]);

  return <Group name={"tools"}>
    <Tool
      config={props.config}
      dispatch={props.dispatch}
      onSelectObject={props.onSelectObject}
      onHoverObject={props.onHoverObject}
      onToolSlotHoverObject={props.onToolSlotHoverObject}
      positionHelpers={positionHelpers}
      mountedToolName={mountedToolName}
      x={props.configPosition.x}
      y={props.configPosition.y}
      z={props.configPosition.z + (isUndefined(props.toolSlots) ? 1 : -2)}
      toolName={mountedToolName}
      toolPulloutDirection={ToolPulloutDirection.NONE}
      onHoverLabel={props.onHoverLabel}
      inToolbay={false} />
    {isUndefined(props.toolSlots) && (props.config.kitVersion == "v1.9"
      ? <PromoToolbay5 config={props.config} />
      : <PromoToolbay3 config={props.config} />)}
    {tools.map((tool, i) =>
      <Tool key={i}
        config={props.config}
        dispatch={props.dispatch}
        onSelectObject={props.onSelectObject}
        onHoverObject={props.onHoverObject}
        onToolSlotHoverObject={props.onToolSlotHoverObject}
        onHoverLabel={props.onHoverLabel}
        positionHelpers={positionHelpers}
        mountedToolName={mountedToolName}
        {...tool}
        x={tool.gantryMounted ? mirroredBotX : tool.x}
        y={tool.gantryMounted
          ? tool.y - props.config.bedYOffset
          : tool.y}
        inToolbay={true} />)}
  </Group>;
};

export const Tools = React.memo(ToolsBase, toolsPropsEqual);

interface OpacityFilterProps {
  opacity: number;
  children?: React.ReactNode;
}

const OpacityFilter = (props: OpacityFilterProps) => {
  // eslint-disable-next-line no-null/no-null
  const groupRef = React.useRef<THREE.Group>(null);
  const appliedOpacityRef = React.useRef<number | undefined>(undefined);
  React.useLayoutEffect(() => {
    if (props.opacity >= 1 && isUndefined(appliedOpacityRef.current)) { return; }
    const current = groupRef.current as THREE.Group | { traverse?: Function } | null;
    if (current && typeof current.traverse == "function") {
      current.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = props.opacity;
          child.material.needsUpdate = true;
        }
      });
      appliedOpacityRef.current = props.opacity;
    }
  }, [props.opacity]);
  return <Group ref={groupRef}>{props.children}</Group>;
};

const displayedPulloutDirection = (
  toolPulloutDirection: ToolPulloutDirection,
  mirrorX: boolean,
  mirrorY: boolean,
): ToolPulloutDirection => {
  switch (toolPulloutDirection) {
    case ToolPulloutDirection.POSITIVE_X:
      return mirrorX
        ? ToolPulloutDirection.NEGATIVE_X
        : ToolPulloutDirection.POSITIVE_X;
    case ToolPulloutDirection.NEGATIVE_X:
      return mirrorX
        ? ToolPulloutDirection.POSITIVE_X
        : ToolPulloutDirection.NEGATIVE_X;
    case ToolPulloutDirection.POSITIVE_Y:
      return mirrorY
        ? ToolPulloutDirection.NEGATIVE_Y
        : ToolPulloutDirection.POSITIVE_Y;
    case ToolPulloutDirection.NEGATIVE_Y:
      return mirrorY
        ? ToolPulloutDirection.POSITIVE_Y
        : ToolPulloutDirection.NEGATIVE_Y;
    default:
      return toolPulloutDirection;
  }
};

const rotationFactor = (toolPulloutDirection: ToolPulloutDirection) => {
  switch (toolPulloutDirection) {
    case ToolPulloutDirection.POSITIVE_X: return 3;
    case ToolPulloutDirection.POSITIVE_Y: return 4;
    case ToolPulloutDirection.NEGATIVE_X: return 1;
    case ToolPulloutDirection.NEGATIVE_Y: return 2;
  }
};

const Toolbay1ModelBase = () => {
  const toolbay1 = useGLTF(ASSETS.models.toolbay1, LIB_DIR) as unknown as Toolbay1;
  return <>
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
  </>;
};
const Toolbay1Model = React.memo(Toolbay1ModelBase);

interface ToolbaySlotProps {
  position: Record<Xyz, number>;
  children?: React.ReactNode;
  toolPulloutDirection: ToolPulloutDirection;
  mounted: boolean;
  id: number | undefined;
  inToolbay: boolean;
  dispatch?: Function;
  config: Config;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
}

const stopPropagationForSelectedSlot = (
  event: ThreeEvent<MouseEvent>,
  onSelectObject: ThreeDObjectSelectionHandler,
  selection: ThreeDObjectSelection,
) =>
  onSelectObject(selection) !== false && event.stopPropagation?.();

const useToolSlotClick = (props: ToolbaySlotProps) => {
  const navigate = useNavigate();
  return (event: ThreeEvent<MouseEvent>) => {
    if (clickWasDragged(event)) { return; }
    const utmSelection = !props.inToolbay;
    if ((props.id || utmSelection) && (props.dispatch || props.onSelectObject) &&
      ![...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
      if (props.onSelectObject) {
        const selection: ThreeDObjectSelection = props.id
          ? { kind: "slot", id: props.id }
          : { kind: "utm", id: 0 };
        stopPropagationForSelectedSlot(event, props.onSelectObject, selection);
        return;
      }
      event.stopPropagation?.();
      if (props.id) {
        props.dispatch?.(setPanelOpen3D(true));
        navigate(Path.toolSlots(props.id));
      } else {
        props.dispatch?.(setPanelOpen3D(true));
        navigate(Path.tools());
      }
    }
  };
};

const TOOLBAY_SLOT_Z_OFFSET = -9;
const SEED_TROUGH_SLOT_Z_OFFSET = -40;

const ToolbaySlot = (props: ToolbaySlotProps) => {
  const { position, children, toolPulloutDirection, mounted } = props;
  const selectable = !!props.id || !props.inToolbay;
  let selection: ThreeDObjectSelection | undefined = undefined;
  if (props.id) {
    selection = { kind: "slot", id: props.id };
  }
  const rotationMultiplier =
    rotationFactor(displayedPulloutDirection(
      toolPulloutDirection,
      props.config.mirrorX,
      props.config.mirrorY));
  const onClick = useToolSlotClick(props);
  return <Group name={props.inToolbay ? "slot" : "utm-tool"}
    position={[
      position.x,
      position.y,
      position.z + TOOLBAY_SLOT_Z_OFFSET,
    ]}
    onClick={onClick}
    onPointerOver={() => {
      if (!selectable) { return; }
      props.onHoverObject?.(true);
      props.onHoverLabel?.(selection);
    }}
    onPointerOut={() => {
      if (!selectable) { return; }
      props.onHoverObject?.(false);
      props.onHoverLabel?.(undefined);
    }}>
    {rotationMultiplier &&
      <Group name={"bay"}
        rotation={[0, 0, rotationMultiplier * Math.PI / 2]}>
        <Toolbay1Model />
      </Group>}
    <OpacityFilter opacity={mounted ? 0.25 : 1}>
      {children}
    </OpacityFilter>
  </Group>;
};

interface ToolProps extends ThreeDTool {
  inToolbay: boolean;
  mountedToolName: string | undefined;
  config: Config;
  dispatch?: Function;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onToolSlotHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
  positionHelpers: ToolPositionHelpers;
}

interface ToolModelProps {
  config: Config;
  inToolbay: boolean;
}

const RotaryToolModel = React.memo(
  React.forwardRef<THREE.Mesh>((_props, ref) => {
    const rotaryToolBase =
      useGLTF(ASSETS.models.rotaryToolBase, LIB_DIR) as unknown as Model;
    const rotaryToolImplement =
      useGLTF(ASSETS.models.rotaryToolImplement, LIB_DIR) as unknown as Model;
    return <Group name={"rotaryTool"}
      position={[
        0,
        0,
        10,
      ]}
      rotation={[0, 0, Math.PI / 2]}>
      <ModelMesh name={"rotaryToolBase"}
        model={rotaryToolBase} />
      <Group
        position={[0, -3, -52]}
        rotation={[-10 * Math.PI / 180, 0, 0]}>
        <ModelMesh name={"rotaryToolImplement"}
          ref={ref}
          model={rotaryToolImplement} />
      </Group>
    </Group>;
  }),
);
RotaryToolModel.displayName = "RotaryToolModel";

const WateringNozzleToolModel = React.memo(() => {
  const wateringNozzle = useGLTF(
    ASSETS.models.wateringNozzle, LIB_DIR) as unknown as WateringNozzle;
  return <Mesh name={"wateringNozzle"}
    position={[
      6.25,
      10.875,
      15,
    ]}
    rotation={[0, 0, 2.094 + Math.PI / 2]}
    scale={1000}
    geometry={wateringNozzle.nodes[PartName.wateringNozzle].geometry}
    material={wateringNozzle.materials.PaletteMaterial001} />;
});

const SeedBinToolModel = React.memo(() => {
  const seedBin = useGLTF(ASSETS.models.seedBin, LIB_DIR) as unknown as SeedBin;
  return <Mesh name={"seedBin"}
    position={[
      0,
      0,
      -4,
    ]}
    rotation={[0, 0, Math.PI / 2]}
    scale={1000}
    geometry={seedBin.nodes[PartName.seedBin].geometry}>
    <MeshPhongMaterial color={"silver"} />
  </Mesh>;
});

const SeedTrayToolModel = React.memo(() => {
  const seedTray = useGLTF(ASSETS.models.seedTray, LIB_DIR) as unknown as SeedTray;
  return <Mesh name={"seedTray"}
    position={[
      0,
      0,
      -4,
    ]}
    rotation={[0, 0, Math.PI / 2]}
    scale={1000}
    geometry={seedTray.nodes[PartName.seedTray].geometry}>
    <MeshPhongMaterial color={"silver"} />
  </Mesh>;
});

const SoilSensorToolModel = React.memo(() => {
  const soilSensor = useGLTF(ASSETS.models.soilSensor, LIB_DIR) as unknown as SoilSensorFull;
  return <SoilSensorModel
    model={soilSensor}
    name={"soilSensor"}
    position={[
      0,
      0,
      10,
    ]}
    rotation={[0, 0, Math.PI / 2]}
    scale={1000} />;
});

const SeederToolModel = React.memo((props: ToolModelProps) => {
  const seeder = useGLTF(ASSETS.models.seeder, LIB_DIR) as unknown as Seeder;
  return <>
    <Mesh name={"seeder"}
      position={[
        0,
        0,
        -5,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={seeder.nodes[PartName.seeder].geometry}
      material={seeder.materials.PaletteMaterial001} />
    {!props.inToolbay && props.config.vacuum &&
      <Group position={[20, 0, -30]}>
        <React.Suspense fallback={undefined}>
          <SuctionAnimations zValues={[-50, -80, -95, -100]} />
        </React.Suspense>
      </Group>}
  </>;
}, (prev, next) =>
  prev.inToolbay == next.inToolbay &&
  prev.config.vacuum == next.config.vacuum);

const WeederToolModel = React.memo(() => {
  const weeder = useGLTF(ASSETS.models.weeder, LIB_DIR) as unknown as Weeder;
  return <Mesh name={"weeder"}
    position={[
      -25,
      20,
      10,
    ]}
    rotation={[0, 0, -Math.PI]}
    scale={1000}
    geometry={weeder.nodes[PartName.weeder].geometry}
    material={weeder.materials.PaletteMaterial001} />;
});

interface SeedTroughToolModelProps {
  firstTrough?: boolean;
}

const SeedTroughWithAssemblyToolModel = React.memo(() => {
  const seedTroughHolder = useGLTF(
    ASSETS.models.seedTroughHolder, LIB_DIR) as unknown as SeedTroughHolderFull;
  const seedTroughAssembly = useGLTF(
    ASSETS.models.seedTroughAssembly,
    LIB_DIR) as unknown as SeedTroughAssemblyFull;
  return <Group name={"seedTroughWithAssembly"}>
    <SeedTroughAssemblyModel
      model={seedTroughAssembly}
      name={"seedTroughAssembly"}
      position={[3, 5, 30]}
      scale={1000} />
    <SeedTroughHolderModel
      model={seedTroughHolder}
      name={"seedTroughHolder"}
      scale={1000} />
  </Group>;
});

const SeedTroughOnlyToolModel = React.memo(() => {
  const seedTrough = useGLTF(ASSETS.models.seedTrough, LIB_DIR) as unknown as SeedTrough;
  return <Mesh name={"seedTrough"}
    position={[
      11.25,
      5,
      30,
    ]}
    scale={1000}
    geometry={seedTrough.nodes[PartName.seedTrough].geometry}
    material={seedTrough.materials[SeedTroughAssemblyMaterial.two]} />;
});

const SeedTroughToolModel = React.memo((props: SeedTroughToolModelProps) =>
  props.firstTrough
    ? <SeedTroughWithAssemblyToolModel />
    : <SeedTroughOnlyToolModel />);

interface SeedTroughToolSlotProps extends ToolbaySlotProps {
  firstTrough?: boolean;
}

const SeedTroughToolSlot = (props: SeedTroughToolSlotProps) => {
  const onClick = useToolSlotClick(props);
  const selectable = !!props.id;
  const selection: ThreeDObjectSelection | undefined = props.id
    ? { kind: "slot", id: props.id }
    : undefined;
  return <Group
    position={[
      props.position.x - 19,
      props.position.y + 5,
      props.position.z + SEED_TROUGH_SLOT_Z_OFFSET,
    ]}
    rotation={[0, 0, Math.PI / 2]}
    onClick={onClick}
    onPointerOver={() => {
      if (!selectable) { return; }
      props.onHoverObject?.(true);
      props.onHoverLabel?.(selection);
    }}
    onPointerOut={() => {
      if (!selectable) { return; }
      props.onHoverObject?.(false);
      props.onHoverLabel?.(undefined);
    }}>
    <SeedTroughToolModel firstTrough={props.firstTrough} />
  </Group>;
};

interface ActiveRotaryToolSlotProps extends ToolbaySlotProps {
  rotary: number;
}

const ActiveRotaryToolSlot = (props: ActiveRotaryToolSlotProps) => {
  const rotaryToolImplementRef =
    React.useRef<THREE.Mesh>(undefined as unknown as THREE.Mesh);
  const { rotary, ...slotProps } = props;
  useFrame(() => {
    if (rotaryToolImplementRef.current && rotary) {
      const time = Date.now();
      const speed = rotary > 0 ? 0.01 : -0.01;
      rotaryToolImplementRef.current.rotation.z = time * speed;
    }
  });
  return <ToolbaySlot {...slotProps}>
    <RotaryToolModel ref={rotaryToolImplementRef} />
  </ToolbaySlot>;
};

// eslint-disable-next-line complexity
const ToolBase = (props: ToolProps) => {
  const {
    toolPulloutDirection, inToolbay, id, mountedToolName, config, dispatch,
  } = props;
  const mounted = inToolbay && props.toolName == mountedToolName;
  const position =
    getToolRenderPosition(config, props, inToolbay, props.positionHelpers);
  const onHoverObject = inToolbay
    ? props.onToolSlotHoverObject || props.onHoverObject
    : props.onHoverObject;
  const common: ToolbaySlotProps = {
    mounted, position, toolPulloutDirection, id, inToolbay, config, dispatch,
    onSelectObject: props.onSelectObject,
    onHoverObject,
    onHoverLabel: props.onHoverLabel,
  };
  switch (props.toolName) {
    case ToolName.rotaryTool:
      return inToolbay
        ? <ToolbaySlot {...common}>
          <RotaryToolModel />
        </ToolbaySlot>
        : <ActiveRotaryToolSlot
          {...common}
          rotary={props.config.rotary} />;
    case ToolName.wateringNozzle:
      return <ToolbaySlot {...common}>
        <WateringNozzleToolModel />
      </ToolbaySlot>;
    case ToolName.seedBin:
      return <ToolbaySlot {...common}>
        <SeedBinToolModel />
      </ToolbaySlot>;
    case ToolName.seedTray:
      return <ToolbaySlot {...common}>
        <SeedTrayToolModel />
      </ToolbaySlot>;
    case ToolName.soilSensor:
      return <ToolbaySlot {...common}>
        <SoilSensorToolModel />
      </ToolbaySlot>;
    case ToolName.seeder:
      return <ToolbaySlot {...common}>
        <SeederToolModel config={props.config} inToolbay={inToolbay} />
      </ToolbaySlot>;
    case ToolName.weeder:
      return <ToolbaySlot {...common}>
        <WeederToolModel />
      </ToolbaySlot>;
    case ToolName.seedTrough:
      return <SeedTroughToolSlot
        {...common}
        firstTrough={props.firstTrough} />;
    default:
      return <ToolbaySlot {...common} />;
  }
};

const Tool = React.memo(ToolBase);
