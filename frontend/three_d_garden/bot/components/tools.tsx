import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { threeSpace, zDir as zDirFunc, zZero as zZeroFunc } from "../../helpers";
import { Config } from "../../config";
import { GLTF } from "three-stdlib";
import {
  ASSETS, HOVER_OBJECT_MODES, LIB_DIR, PartName, SeedTroughAssemblyMaterial,
} from "../../constants";
import {
  SoilSensor, SoilSensorFull,
  SeedTroughAssembly, SeedTroughAssemblyFull,
  SeedTroughHolder, SeedTroughHolderFull,
} from "../parts";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { distinguishableBlack, utmHeight } from "../bot";
import { SlotWithTool } from "../../../resources/interfaces";
import { isUndefined, sortBy } from "lodash";
import {
  reduceToolName, ToolName,
} from "../../../farm_designer/map/tool_graphics/all_tools";
import { Xyz } from "farmbot";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { WateringAnimations } from "./watering_animations";
import { useNavigate } from "react-router";
import { Path } from "../../../internal_urls";
import { setPanelOpen } from "../../../farm_designer/panel_header";
import { getMode } from "../../../farm_designer/map/util";
import { PROMO_TOOLS } from "../../../promo/tools";
import { useFrame } from "@react-three/fiber";
import { Model, ModelMesh } from "../../model_mesh";
import { SuctionAnimation } from "./suction_animation";

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
  toolPulloutDirection: ToolPulloutDirection;
  firstTrough?: boolean;
  gantryMounted?: boolean;
}

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

export const Tools = (props: ToolsProps) => {
  const {
    bedXOffset, bedYOffset, bedLengthOuter, bedWidthOuter, bedWallThickness,
  } = props.config;
  const botPosition = {
    x: props.config.x,
    y: props.config.y,
    z: props.config.z,
  };
  const mountedToolName = isUndefined(props.toolSlots)
    ? props.config.tool
    : reduceToolName(props.mountedToolName);
  const zZero = zZeroFunc(props.config);
  const zDir = zDirFunc(props.config);

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

  const rotationFactor = (toolPulloutDirection: ToolPulloutDirection) => {
    switch (toolPulloutDirection) {
      case ToolPulloutDirection.POSITIVE_X: return 3;
      case ToolPulloutDirection.POSITIVE_Y: return 4;
      case ToolPulloutDirection.NEGATIVE_X: return 1;
      case ToolPulloutDirection.NEGATIVE_Y: return 2;
    }
  };

  interface ToolbaySlotProps {
    position: Record<Xyz, number>;
    children?: React.ReactNode;
    toolPulloutDirection: ToolPulloutDirection;
    mounted: boolean;
    id: number | undefined;
    inToolbay: boolean;
  }

  const ToolbaySlot = (slotProps: ToolbaySlotProps) => {
    const { position, children, toolPulloutDirection, mounted } = slotProps;
    const rotationMultiplier = rotationFactor(toolPulloutDirection);
    const navigate = useNavigate();
    return <Group name={slotProps.inToolbay ? "slot" : "utm-tool"}
      position={[
        position.x + 5,
        position.y,
        position.z - 9,
      ]}
      onClick={() => {
        if (slotProps.id && !isUndefined(props.dispatch) &&
          !HOVER_OBJECT_MODES.includes(getMode())) {
          props.dispatch(setPanelOpen(true));
          navigate(Path.toolSlots(slotProps.id));
        }
      }}>
      {rotationMultiplier &&
        <Group name={"bay"}
          rotation={[0, 0, rotationMultiplier * Math.PI / 2]}>
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
    </Group>;
  };

  interface ToolProps extends ThreeDTool {
    inToolbay: boolean;
  }

  // eslint-disable-next-line complexity
  const Tool = (toolProps: ToolProps) => {
    const { toolPulloutDirection, inToolbay, id } = toolProps;
    const mounted = inToolbay && toolProps.toolName == mountedToolName;
    const position = {
      x: threeSpace(toolProps.x, bedLengthOuter) + bedXOffset,
      y: threeSpace(toolProps.y, bedWidthOuter) + bedYOffset,
      z: zZero - zDir * toolProps.z + (inToolbay ? 0 : (utmHeight / 2 - 15)),
    };
    const common: ToolbaySlotProps = {
      mounted, position, toolPulloutDirection, id, inToolbay,
    };

    // eslint-disable-next-line no-null/no-null
    const rotaryToolImplementRef = React.useRef<THREE.Mesh>(null);

    useFrame(() => {
      if (rotaryToolImplementRef.current && !inToolbay && props.config.rotary) {
        const time = Date.now();
        const speed = props.config.rotary > 0 ? 0.01 : -0.01;
        rotaryToolImplementRef.current.rotation.z = time * speed;
      }
    });
    const X = 5.5;
    switch (toolProps.toolName) {
      case ToolName.rotaryTool:
        return <ToolbaySlot {...common}>
          <Group name={"rotaryTool"}
            position={[
              X,
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
                ref={rotaryToolImplementRef}
                model={rotaryToolImplement} />
            </Group>
          </Group>
        </ToolbaySlot>;
      case ToolName.wateringNozzle:
        return <ToolbaySlot {...common}>
          <Mesh name={"wateringNozzle"}
            position={[
              X + 7.5,
              10.5,
              15,
            ]}
            rotation={[0, 0, 2.094 + Math.PI / 2]}
            scale={1000}
            geometry={wateringNozzle.nodes[PartName.wateringNozzle].geometry}
            material={wateringNozzle.materials.PaletteMaterial001} />
          {!inToolbay && props.config.waterFlow &&
            <WateringAnimations
              waterFlow={props.config.waterFlow}
              botPosition={botPosition}
              getZ={props.getZ} />}
        </ToolbaySlot>;
      case ToolName.seedBin:
        return <ToolbaySlot {...common}>
          <Mesh name={"seedBin"}
            position={[
              X,
              0,
              -4,
            ]}
            rotation={[0, 0, Math.PI / 2]}
            scale={1000}
            geometry={seedBin.nodes[PartName.seedBin].geometry}>
            <MeshPhongMaterial color={"silver"} />
          </Mesh>
        </ToolbaySlot>;
      case ToolName.seedTray:
        return <ToolbaySlot {...common}>
          <Mesh name={"seedTray"}
            position={[
              X,
              0,
              -4,
            ]}
            rotation={[0, 0, Math.PI / 2]}
            scale={1000}
            geometry={seedTray.nodes[PartName.seedTray].geometry}>
            <MeshPhongMaterial color={"silver"} />
          </Mesh>
        </ToolbaySlot>;
      case ToolName.soilSensor:
        return <ToolbaySlot {...common}>
          <SoilSensorComponent name={"soilSensor"}
            position={[
              X,
              0,
              10,
            ]}
            rotation={[0, 0, Math.PI / 2]}
            scale={1000} />
        </ToolbaySlot>;
      case ToolName.seeder:
        return <ToolbaySlot {...common}>
          <Mesh name={"seeder"}
            position={[
              X,
              0,
              -5,
            ]}
            rotation={[0, 0, Math.PI / 2]}
            scale={1000}
            geometry={seeder.nodes[PartName.seeder].geometry}
            material={seeder.materials.PaletteMaterial001} />
          {!inToolbay && props.config.vacuum &&
            <Group position={[20, 0, -30]}>
              {[-50, -80, -95, -100].map(z =>
                <SuctionAnimation key={z} z={z} />)}
            </Group>}
        </ToolbaySlot>;
      case ToolName.weeder:
        return <ToolbaySlot {...common}>
          <Mesh name={"weeder"}
            position={[
              X - 25,
              20,
              10,
            ]}
            rotation={[0, 0, -Math.PI]}
            scale={1000}
            geometry={weeder.nodes[PartName.weeder].geometry}
            material={weeder.materials.PaletteMaterial001} />
        </ToolbaySlot>;
      case ToolName.seedTrough:
        return <Group
          position={[
            position.x - 30,
            position.y - 15,
            position.z,
          ]}
          rotation={[0, 0, Math.PI / 2]}>
          {toolProps.firstTrough
            ? <Group name={"seedTroughWithAssembly"}>
              <SeedTroughAssemblyComponent name={"seedTroughAssembly"}
                position={[3, -15, 30]}
                scale={1000} />
              <SeedTroughHolderComponent name={"seedTroughHolder"}
                scale={1000} />
            </Group>
            : <Mesh name={"seedTrough"}
              position={[
                15,
                -15,
                30,
              ]}
              scale={1000}
              geometry={seedTrough.nodes[PartName.seedTrough].geometry}
              material={seedTrough.materials[SeedTroughAssemblyMaterial.two]} />}
        </Group>;
      default:
        return <ToolbaySlot {...common} />;
    }
  };

  const tools = isUndefined(props.toolSlots)
    ? PROMO_TOOLS(props.config)
    : convertSlotsWithTools(props.toolSlots);

  return <Group name={"tools"}>
    <Tool
      x={botPosition.x}
      y={botPosition.y}
      z={botPosition.z + (isUndefined(props.toolSlots) ? 1 : -2)}
      toolName={mountedToolName}
      toolPulloutDirection={ToolPulloutDirection.NONE}
      inToolbay={false} />
    {isUndefined(props.toolSlots) && <Group name={"toolbay3"}>
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
    </Group>}
    {tools.map((tool, i) =>
      <Tool key={i}
        {...tool}
        x={tool.gantryMounted ? botPosition.x : tool.x}
        inToolbay={true} />)}
  </Group>;
};

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
