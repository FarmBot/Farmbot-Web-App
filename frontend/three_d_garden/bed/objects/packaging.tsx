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

export const Packaging = React.memo((props: PackagingProps) => {
  const { config } = props;
  const isXL = config.sizePreset == "Genesis XL";
  const mainCartonLength = 1060;
  const mainCartonWidth = 420;
  const mainCartonHeight = mainCartonHeightFunc(config.kitVersion);
  const extrusionKitLength = 1540;
  const extrusionKitWidth = isXL ? 170 : 100;
  const extrusionKitHeight = 60;
  const edgeProtectorSize = 20;
  const edgeProtector = React.useCallback((boxDimension: number) => {
    const edgeProtectorCenter = edgeProtectorSize / 2 - 1;
    const boxDimensionMid = boxDimension / 2;
    return edgeProtectorCenter - boxDimensionMid;
  }, [edgeProtectorSize]);
  const strapThickness = 4;
  const strapWidth = 10;
  const strap = React.useCallback(
    (boxDimension: number) => boxDimension + strapThickness,
    [strapThickness],
  );
  const zGround = React.useMemo(
    () => -config.bedZOffset - config.bedHeight,
    [config.bedHeight, config.bedZOffset],
  );
  const boxColor = "#bf8b59";
  const strapColor = "#434343";
  const edgeProtectorColor = "#9d6c40";
  const packagingPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(config.bedLengthOuter - 800, config.bedLengthOuter),
    threeSpace(-700, config.bedWidthOuter),
    zGround + (mainCartonHeight / 2),
  ]), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    mainCartonHeight,
    zGround,
  ]);
  const mainCartonArgs = React.useMemo<[number, number, number]>(
    () => [mainCartonLength, mainCartonWidth, mainCartonHeight],
    [mainCartonHeight, mainCartonLength, mainCartonWidth],
  );
  const mainTextPosition = React.useMemo<[number, number, number]>(
    () => [0, -mainCartonWidth / 2 - 1, 0],
    [mainCartonWidth],
  );
  const mainTextRotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, 0], []);
  const mainStrapXs = React.useMemo(() => [-450, 0, 450], []);
  const mainStrapArgs = React.useMemo<[number, number, number]>(
    () => [strapWidth, strap(mainCartonWidth), strap(mainCartonHeight)],
    [mainCartonHeight, mainCartonWidth, strap, strapWidth],
  );
  const mainEdgeProtectors = React.useMemo(() => ([
    [-edgeProtector(mainCartonWidth), -edgeProtector(mainCartonHeight)],
    [-edgeProtector(mainCartonWidth), edgeProtector(mainCartonHeight)],
    [edgeProtector(mainCartonWidth), -edgeProtector(mainCartonHeight)],
    [edgeProtector(mainCartonWidth), edgeProtector(mainCartonHeight)],
  ] as [number, number][]), [
    edgeProtector,
    mainCartonHeight,
    mainCartonWidth,
  ]);
  const extrusionVisible = React.useMemo(
    () => extrusionKitVisibility(config.kitVersion),
    [config.kitVersion],
  );
  const extrusionKitPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, (220 + 60) / 2], []);
  const extrusionKitArgs = React.useMemo<[number, number, number]>(
    () => [extrusionKitLength, extrusionKitWidth, extrusionKitHeight],
    [extrusionKitHeight, extrusionKitLength, extrusionKitWidth],
  );
  const extrusionStrapXs = React.useMemo(
    () => [-600, -300, 0, 300, 600],
    [],
  );
  const extrusionStrapArgs = React.useMemo<[number, number, number]>(
    () => [strapWidth, strap(extrusionKitWidth), strap(extrusionKitHeight)],
    [extrusionKitHeight, extrusionKitWidth, strap, strapWidth],
  );
  const extrusionEdgeProtectors = React.useMemo(() => ([
    [-edgeProtector(extrusionKitWidth), -edgeProtector(extrusionKitHeight)],
    [-edgeProtector(extrusionKitWidth), edgeProtector(extrusionKitHeight)],
    [edgeProtector(extrusionKitWidth), -edgeProtector(extrusionKitHeight)],
    [edgeProtector(extrusionKitWidth), edgeProtector(extrusionKitHeight)],
  ] as [number, number][]), [
    edgeProtector,
    extrusionKitHeight,
    extrusionKitWidth,
  ]);
  const labelText = React.useMemo(
    () => `${config.label} ${config.kitVersion}`,
    [config.kitVersion, config.label],
  );

  return <Group name={"packaging"}
    visible={config.packaging}
    position={packagingPosition}>
    <Group name={"main-carton"}>
      <Box name={"main-carton-box"}
        castShadow={true}
        receiveShadow={true}
        args={mainCartonArgs}>
        <MeshPhongMaterial color={boxColor} />
      </Box>
      <Text
        fontSize={55}
        color={"black"}
        position={mainTextPosition}
        rotation={mainTextRotation}>
        {labelText}
      </Text>
      {mainStrapXs.map(x =>
        <Box name={"main-carton-strap"} key={x}
          args={mainStrapArgs}
          position={[x, 0, 0]}>
          <MeshPhongMaterial color={strapColor} />
        </Box>)}
      {mainEdgeProtectors.map(([y, z], index) =>
        <Box name={"main-carton-edge-protector"} key={index}
          args={[mainCartonLength - 2, edgeProtectorSize, edgeProtectorSize]}
          position={[0, y, z]}>
          <MeshPhongMaterial color={edgeProtectorColor} />
        </Box>)}
    </Group>
    <Group name={"extrusion-kit"}
      visible={extrusionVisible}
      position={extrusionKitPosition}>
      <Box name={"extrusion-kit-box"}
        castShadow={true}
        args={extrusionKitArgs}>
        <MeshPhongMaterial color={boxColor} />
      </Box>
      {extrusionStrapXs.map(x =>
        <Box name={"extrusion-kit-strap"} key={x}
          args={extrusionStrapArgs}
          position={[x, 0, 0]}>
          <MeshPhongMaterial color={strapColor} />
        </Box>)}
      {extrusionEdgeProtectors.map(([y, z], index) =>
        <Box name={"extrusion-kit-edge-protector"} key={index}
          args={[extrusionKitLength - 2, edgeProtectorSize, edgeProtectorSize]}
          position={[0, y, z]}>
          <MeshPhongMaterial color={edgeProtectorColor} />
        </Box>)}
    </Group>
  </Group>;
});
