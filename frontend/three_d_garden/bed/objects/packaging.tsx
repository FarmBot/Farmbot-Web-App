import React from "react";
import { Box } from "@react-three/drei";
import { threeSpace } from "../../helpers";
import { Config } from "../../config";
import { Group, MeshPhongMaterial } from "../../components";
import { Text } from "../../elements";

const mainCartonHeightFunc = (kitVersion: string): number => {
  switch (kitVersion) {
    case "v1.7":
      return 220;
    case "v1.8":
    default:
      return 245;
  }
};

const extrusionKitVisibility = (kitVersion: string) => {
  switch (kitVersion) {
    case "v1.7":
      return true;
    case "v1.8":
    default:
      return false;
  }
};

export interface PackagingProps {
  config: Config;
}

export const Packaging = (props: PackagingProps) => {
  const { config } = props;
  const isXL = config.sizePreset == "Genesis XL";
  const mainCartonLength = 1060;
  const mainCartonWidth = 420;
  const mainCartonHeight = mainCartonHeightFunc(config.kitVersion);
  const extrusionKitLength = 1540;
  const extrusionKitWidth = isXL ? 170 : 100;
  const extrusionKitHeight = 60;
  const edgeProtectorSize = 20;
  const edgeProtector = (boxDimension: number) => {
    const edgeProtectorCenter = edgeProtectorSize / 2 - 1;
    const boxDimensionMid = boxDimension / 2;
    return edgeProtectorCenter - boxDimensionMid;
  };
  const strapThickness = 4;
  const strapWidth = 10;
  const strap = (boxDimension: number) => boxDimension + strapThickness;
  const zGround = -config.bedZOffset - config.bedHeight;
  const boxColor = "#bf8b59";
  const strapColor = "#434343";
  const edgeProtectorColor = "#9d6c40";

  return <Group name={"packaging"}
    visible={config.packaging}
    position={[
      threeSpace(config.bedLengthOuter - 800, config.bedLengthOuter),
      threeSpace(-700, config.bedWidthOuter),
      zGround + (mainCartonHeight / 2),
    ]}>
    <Group name={"main-carton"}>
      <Box name={"main-carton-box"}
        castShadow={true}
        receiveShadow={true}
        args={[mainCartonLength, mainCartonWidth, mainCartonHeight]}>
        <MeshPhongMaterial color={boxColor} />
      </Box>
      <Text
        fontSize={55}
        color={"black"}
        position={[0, -mainCartonWidth / 2 - 1, 0]}
        rotation={[Math.PI / 2, 0, 0]}>
        {`${config.label} ${config.kitVersion}`}
      </Text>
      {[-450, 0, 450].map(x =>
        <Box name={"main-carton-strap"} key={x}
          args={[strapWidth, strap(mainCartonWidth), strap(mainCartonHeight)]}
          position={[x, 0, 0]}>
          <MeshPhongMaterial color={strapColor} />
        </Box>)}
      {[
        [-edgeProtector(mainCartonWidth), -edgeProtector(mainCartonHeight)],
        [-edgeProtector(mainCartonWidth), edgeProtector(mainCartonHeight)],
        [edgeProtector(mainCartonWidth), -edgeProtector(mainCartonHeight)],
        [edgeProtector(mainCartonWidth), edgeProtector(mainCartonHeight)],
      ].map(([y, z], index) =>
        <Box name={"main-carton-edge-protector"} key={index}
          args={[mainCartonLength - 2, edgeProtectorSize, edgeProtectorSize]}
          position={[0, y, z]}>
          <MeshPhongMaterial color={edgeProtectorColor} />
        </Box>)}
    </Group>
    <Group name={"extrusion-kit"}
      visible={extrusionKitVisibility(config.kitVersion)}
      position={[0, 0, (220 + 60) / 2]}>
      <Box name={"extrusion-kit-box"}
        castShadow={true}
        args={[extrusionKitLength, extrusionKitWidth, extrusionKitHeight]}>
        <MeshPhongMaterial color={boxColor} />
      </Box>
      {[-600, -300, 0, 300, 600].map(x =>
        <Box name={"extrusion-kit-strap"} key={x}
          args={[strapWidth, strap(extrusionKitWidth), strap(extrusionKitHeight)]}
          position={[x, 0, 0]}>
          <MeshPhongMaterial color={strapColor} />
        </Box>)}
      {[
        [-edgeProtector(extrusionKitWidth), -edgeProtector(extrusionKitHeight)],
        [-edgeProtector(extrusionKitWidth), edgeProtector(extrusionKitHeight)],
        [edgeProtector(extrusionKitWidth), -edgeProtector(extrusionKitHeight)],
        [edgeProtector(extrusionKitWidth), edgeProtector(extrusionKitHeight)],
      ].map(([y, z], index) =>
        <Box name={"extrusion-kit-edge-protector"} key={index}
          args={[extrusionKitLength - 2, edgeProtectorSize, edgeProtectorSize]}
          position={[0, y, z]}>
          <MeshPhongMaterial color={edgeProtectorColor} />
        </Box>)}
    </Group>
  </Group>;
};
