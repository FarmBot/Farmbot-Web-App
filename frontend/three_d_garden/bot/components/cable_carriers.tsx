import React from "react";
import * as THREE from "three";
import { Extrude, useGLTF } from "@react-three/drei";
import { Shape } from "three";
import {
  threeSpace,
  zDir as zDirFunc,
  zZero as zZeroFunc,
} from "../../helpers";
import { Config } from "../../config";
import { GLTF } from "three-stdlib";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import { range } from "lodash";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { distinguishableBlack, extrusionWidth } from "../bot";
import { EMISSIVE_PROPS } from "./gantry_beam";

type CCSupportHorizontal = GLTF & {
  nodes: { [PartName.ccSupportHorizontal]: THREE.Mesh };
  materials: never;
}
type CCSupportVertical = GLTF & {
  nodes: { [PartName.ccSupportVertical]: THREE.Mesh };
  materials: never;
}

const ccPath =
  (axisLength: number, y: number, curveDia: number, isX?: boolean) => {
    const lowerLength = (y + axisLength + 180) / 2;
    const upperLength = lowerLength - y;
    const outerRadius = curveDia / 2;
    const height = isX ? 15 : 20;
    const innerRadius = outerRadius - height;

    const path = new Shape();
    path.moveTo(y + 20, 0);
    path.lineTo(y + upperLength, 0);
    path.arc(0, outerRadius, outerRadius, -Math.PI / 2, Math.PI / 2);
    path.lineTo(0, curveDia);
    path.lineTo(0, curveDia - 5);
    path.lineTo(20, curveDia - height);
    path.lineTo(lowerLength, curveDia - height);
    path.arc(0, -innerRadius, innerRadius, Math.PI / 2, -Math.PI / 2, true);
    if (isX) {
      path.lineTo(y + 20, height - 1);
      path.lineTo(y, 5);
      path.lineTo(y, 0);
    } else {
      path.lineTo(y, height - 1);
      path.lineTo(y, height - 5);
    }
    path.lineTo(y + 20, 0);
    return path;
  };

interface CableCarrierXProps {
  config: Config;
}

export const CableCarrierX = (props: CableCarrierXProps) => {
  const {
    x, bedHeight, cableCarriers, botSizeX, bedLengthOuter, bedXOffset,
    tracks, bedWidthOuter
  } = props.config;
  const bedCCSupportHeight = Math.min(150, bedHeight / 2);
  return <Extrude name={"xCC"} visible={cableCarriers}
    castShadow={true}
    args={[
      ccPath(
        botSizeX / 2, botSizeX / 2 - x + 20,
        bedCCSupportHeight - 40,
        true),
      { steps: 1, depth: 22, bevelEnabled: false },
    ]}
    position={[
      threeSpace(botSizeX / 2, bedLengthOuter) + bedXOffset,
      threeSpace((tracks ? 0 : extrusionWidth) - 15, bedWidthOuter),
      -40,
    ]}
    rotation={[-Math.PI / 2, -Math.PI, 0 * Math.PI]}>
    <MeshPhongMaterial color={distinguishableBlack} />
  </Extrude>;
};

interface CableCarrierYProps {
  config: Config;
}

export const CableCarrierY = (props: CableCarrierYProps) => {
  const {
    x, y, columnLength, cableCarriers, botSizeY, bedLengthOuter, bedYOffset,
    bedXOffset, bedWidthOuter, kitVersion,
  } = props.config;
  const ccDepth = (kitVersion: string) => {
    switch (kitVersion) {
      case "v1.7":
        return 60;
      case "v1.8":
      default:
        return 40;
    }
  };
  return <Extrude name={"yCC"} visible={cableCarriers}
    castShadow={true}
    args={[
      ccPath(botSizeY, y + 40, 70),
      { steps: 1, depth: ccDepth(kitVersion), bevelEnabled: false },
    ]}
    position={[
      threeSpace(x - 28, bedLengthOuter) + bedXOffset,
      threeSpace(20, bedWidthOuter) + bedYOffset,
      columnLength + 150,
    ]}
    rotation={[-Math.PI / 2, -Math.PI / 2, 0]}>
    <MeshPhongMaterial color={distinguishableBlack} />
  </Extrude>;
};

interface CableCarrierZProps {
  config: Config;
}

export const CableCarrierZ = (props: CableCarrierZProps) => {
  const {
    x, y, z, cableCarriers, botSizeZ, zGantryOffset, bedLengthOuter, bedYOffset,
    bedXOffset, bedWidthOuter,
  } = props.config;
  const zZero = zZeroFunc(props.config);
  const zDir = zDirFunc(props.config);
  return <Extrude name={"zCC"} visible={cableCarriers}
    castShadow={true}
    args={[
      ccPath(botSizeZ + zGantryOffset - 100, zDir * z + zGantryOffset - 15, 87),
      { steps: 1, depth: 60, bevelEnabled: false },
    ]}
    position={[
      threeSpace(x - 41, bedLengthOuter) + bedXOffset,
      threeSpace(y - 25, bedWidthOuter) + bedYOffset,
      zZero - zDir * z + 125,
    ]}
    rotation={[Math.PI / 2, Math.PI, Math.PI / 2]}>
    <MeshPhongMaterial color={distinguishableBlack} />
  </Extrude>;
};

export interface CableCarrierSupportVerticalProps {
  config: Config;
}

export const CableCarrierSupportVertical =
  (props: CableCarrierSupportVerticalProps) => {
    const {
      x, y, z, bedLengthOuter, bedYOffset, bedXOffset, bedWidthOuter, zAxisLength,
      kitVersion,
    } = props.config;
    const zZero = zZeroFunc(props.config);
    const zDir = zDirFunc(props.config);
    const ccSupportVertical =
      useGLTF(ASSETS.models.ccSupportVertical, LIB_DIR) as CCSupportVertical;
    switch (kitVersion) {
      case "v1.7":
        return <Group name={"ccSupportVertical"}>
          {range((zAxisLength - 350) / 200).map((i) => (
            <Mesh key={i}
              position={[
                threeSpace(x + 20, bedLengthOuter) + bedXOffset,
                threeSpace(y + 55, bedWidthOuter) + bedYOffset,
                zZero - zDir * z + i * 200 + 125,
              ]}
              rotation={[0, 0, Math.PI / 2]}
              scale={1000}
              geometry={
                ccSupportVertical.nodes[PartName.ccSupportVertical].geometry}>
              <MeshPhongMaterial color={"silver"} />
            </Mesh>
          ))}
        </Group>;
      case "v1.8":
        return <Group name={"ccSupportVertical"}>
          <Mesh
            position={[
              threeSpace(x + 20, bedLengthOuter) + bedXOffset,
              threeSpace(y + 35, bedWidthOuter) + bedYOffset,
              zZero - zDir * z + 125,
            ]}
            rotation={[0, 0, 0]}
            geometry={new THREE.ExtrudeGeometry(
              (() => {
                const shape = new THREE.Shape();
                shape.moveTo(0, 0);
                shape.lineTo(0, 20);
                shape.lineTo(15, 20);
                shape.lineTo(20, 1.5);
                shape.lineTo(28.5, 1.5);
                shape.lineTo(28.5, -61);
                shape.lineTo(24, -63);
                shape.lineTo(24, -61.5);
                shape.lineTo(27, -60);
                shape.lineTo(27, 0);
                shape.lineTo(0, 0);
                return shape;
              })(),
              {
                depth: zAxisLength - 350,
                bevelEnabled: false,
              },
            )}>
            <MeshPhongMaterial color={"white"}
              opacity={0.8}
              transparent={true} />
          </Mesh>
        </Group>;
    }
  };

export interface CableCarrierSupportHorizontalProps {
  config: Config;
}

export const CableCarrierSupportHorizontal =
  (props: CableCarrierSupportHorizontalProps) => {
    const {
      x, bedLengthOuter, bedYOffset, bedXOffset, bedWidthOuter, botSizeY,
      columnLength, kitVersion,
    } = props.config;
    const ccSupportHorizontal =
      useGLTF(ASSETS.models.ccSupportHorizontal, LIB_DIR) as CCSupportHorizontal;
    switch (kitVersion) {
      case "v1.7":
        return <Group name={"ccSupportHorizontal"}>
          {range((botSizeY - 10) / 300).map((i) => (
            <Mesh key={i}
              position={[
                threeSpace(x - 28, bedLengthOuter) + bedXOffset,
                threeSpace(50 + i * 300, bedWidthOuter) + bedYOffset,
                columnLength + 60,
              ]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={1000}
              geometry={
                ccSupportHorizontal.nodes[PartName.ccSupportHorizontal].geometry}>
              <MeshPhongMaterial color={"silver"} />
            </Mesh>
          ))};
        </Group>;
      case "v1.8":
        return <Group name={"ccSupportHorizontal"}>
          <Mesh
            position={[
              threeSpace(x - 28, bedLengthOuter) + bedXOffset,
              -(threeSpace(20, bedWidthOuter) + bedYOffset),
              columnLength + 60,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
            geometry={new THREE.ExtrudeGeometry(
              (() => {
                const shape = new THREE.Shape();

                shape.moveTo(0, 0);
                shape.lineTo(0, 20);
                shape.lineTo(-40, 20);
                shape.lineTo(-41, 22.5);
                shape.lineTo(-42.5, 22.5);
                shape.lineTo(-41.5, 18.5);
                shape.lineTo(-30, 18.5);
                shape.lineTo(-25, 0);
                shape.lineTo(0, 0);
                return shape;
              })(),
              {
                depth: botSizeY - 30,
                bevelEnabled: false,
              },
            )}>
            <MeshPhongMaterial color={"white"}
              opacity={0.8}
              {...(props.config.light ? EMISSIVE_PROPS : {})}
              transparent={true} />
          </Mesh>
        </Group>;
    }
  };
