import React from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { threeSpace, zDir as zDirFunc, zZero as zZeroFunc } from "../../helpers";
import { Config } from "../../config";
import { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import {
  RotaryTool, RotaryToolFull,
  SoilSensor, SoilSensorFull,
  SeedTroughAssembly, SeedTroughAssemblyFull,
  SeedTroughHolder, SeedTroughHolderFull,
} from "../parts";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { utmHeight } from "../bot";
import { SlotWithTool } from "../../../resources/interfaces";
import { isUndefined } from "lodash";
import { reduceToolName, ToolName } from "../../../farm_designer/map/tool_graphics/all_tools";

type Toolbay3 = GLTF & {
  nodes: {
    [PartName.toolbay3]: THREE.Mesh;
    [PartName.toolbay3Logo]: THREE.Mesh;
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

export interface ToolsProps {
  config: Config;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
}

export const convertSlotsWithTools = (slotsWithTools: SlotWithTool[]) =>
  slotsWithTools.map(swt => ({
    x: swt.toolSlot.body.x,
    y: swt.toolSlot.body.y,
    z: swt.toolSlot.body.z,
    toolName: reduceToolName(swt.tool?.body.name),
  }));

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
  const rotaryTool = useGLTF(ASSETS.models.rotaryTool, LIB_DIR) as RotaryToolFull;
  const RotaryToolComponent = RotaryTool(rotaryTool);
  const seedBin = useGLTF(ASSETS.models.seedBin, LIB_DIR) as SeedBin;
  const seedTray = useGLTF(ASSETS.models.seedTray, LIB_DIR) as SeedTray;
  const seedTroughHolder = useGLTF(
    ASSETS.models.seedTroughHolder, LIB_DIR) as SeedTroughHolderFull;
  const SeedTroughHolderComponent = SeedTroughHolder(seedTroughHolder);
  const seedTroughAssembly = useGLTF(
    ASSETS.models.seedTroughAssembly, LIB_DIR) as SeedTroughAssemblyFull;
  const SeedTroughAssemblyComponent = SeedTroughAssembly(seedTroughAssembly);
  const soilSensor = useGLTF(ASSETS.models.soilSensor, LIB_DIR) as SoilSensorFull;
  const SoilSensorComponent = SoilSensor(soilSensor);
  const wateringNozzle = useGLTF(
    ASSETS.models.wateringNozzle, LIB_DIR) as WateringNozzle;

  interface ToolProps {
    x: number;
    y: number;
    z: number;
    toolName: string | undefined;
    inToolbay: boolean;
  }

  const Tool = (toolProps: ToolProps) => {
    if (toolProps.inToolbay && toolProps.toolName == mountedToolName) {
      return <></>;
    }
    const position = {
      x: threeSpace(toolProps.x, bedLengthOuter) + bedXOffset,
      y: threeSpace(toolProps.y, bedWidthOuter) + bedYOffset,
      z: zZero - zDir * toolProps.z + (toolProps.inToolbay ? 0 : (utmHeight / 2 - 15)),
    };
    switch (toolProps.toolName) {
      case ToolName.rotaryTool:
        return <RotaryToolComponent name={"rotaryTool"}
          position={[
            position.x + 11,
            position.y,
            position.z,
          ]}
          rotation={[0, 0, Math.PI / 2]}
          scale={1000} />;
      case ToolName.wateringNozzle:
        return <Mesh name={"wateringNozzle"}
          position={[
            position.x + 17,
            position.y + 10,
            position.z + 3,
          ]}
          rotation={[0, 0, 2.094 + Math.PI / 2]}
          scale={1000}
          geometry={wateringNozzle.nodes[PartName.wateringNozzle].geometry}
          material={wateringNozzle.materials.PaletteMaterial001} />;
      case ToolName.seedBin:
        return <Mesh name={"seedBin"}
          position={[
            position.x,
            position.y,
            position.z - 12,
          ]}
          rotation={[0, 0, Math.PI / 2]}
          scale={1000}
          geometry={seedBin.nodes[PartName.seedBin].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>;
      case ToolName.seedTray:
        return <Mesh name={"seedTray"}
          position={[
            position.x,
            position.y,
            position.z - 12,
          ]}
          rotation={[0, 0, Math.PI / 2]}
          scale={1000}
          geometry={seedTray.nodes[PartName.seedTray].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>;
      case ToolName.soilSensor:
        return <SoilSensorComponent name={"soilSensor"}
          position={[
            position.x,
            position.y,
            position.z,
          ]}
          rotation={[0, 0, Math.PI / 2]}
          scale={1000} />;
      case ToolName.seedTrough:
        return <Group
          position={[
            position.x + 32,
            position.y,
            position.z,
          ]}
          rotation={[0, 0, Math.PI / 2]}>
          <SeedTroughAssemblyComponent name={"seedTroughAssembly"}
            position={[3, -15, 30]}
            scale={1000} />
          <SeedTroughHolderComponent name={"seedTroughHolder"}
            scale={1000} />
        </Group>;
      default:
        return <></>;
    }
  };

  const isJr = props.config.sizePreset == "Jr";

  const promoToolOffset = {
    x: 110 + bedWallThickness - bedXOffset,
    y: bedWidthOuter / 2 - bedYOffset,
    z: zZero - 70,
  };

  const PROMO_TOOLS = [
    {
      x: promoToolOffset.x,
      y: (isJr ? 0 : 100) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.rotaryTool,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? 200 : 300) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.seedBin,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? -100 : -200) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.seedTray,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? -200 : -300) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.soilSensor,
    },
    {
      x: promoToolOffset.x,
      y: (isJr ? 100 : 200) + promoToolOffset.y,
      z: promoToolOffset.z,
      toolName: ToolName.wateringNozzle,
    },
    {
      x: botPosition.x - bedXOffset,
      y: -bedYOffset,
      z: zZero - 100,
      toolName: ToolName.seedTrough,
    },
  ];

  const tools = isUndefined(props.toolSlots)
    ? PROMO_TOOLS
    : convertSlotsWithTools(props.toolSlots);

  return <Group name={"tools"}>
    <Tool
      x={botPosition.x}
      y={botPosition.y}
      z={botPosition.z}
      toolName={mountedToolName}
      inToolbay={false} />
    {isUndefined(props.toolSlots) && <Group name={"toolbay3"}>
      {(isJr ? [0] : [-200, 200]).map(yPosition =>
        <Group key={yPosition}>
          {[
            { node: PartName.toolbay3, color: "black", id: "toolbay3" },
            { node: PartName.toolbay3Logo, color: "white", id: "toolbay3Logo" },
          ].map(part =>
            <Mesh name={part.id} key={part.id}
              position={[
                threeSpace(105 + bedWallThickness, bedLengthOuter),
                threeSpace(yPosition + bedWidthOuter / 2, bedWidthOuter),
                60,
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
        x={tool.x}
        y={tool.y}
        z={tool.z}
        toolName={tool.toolName}
        inToolbay={true} />)}
  </Group>;
};
