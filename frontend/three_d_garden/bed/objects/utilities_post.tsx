import React from "react";
import { Box, Cylinder, RoundedBox, Tube, useTexture } from "@react-three/drei";
import { RepeatWrapping } from "three";
import { ASSETS } from "../../constants";
import { Config } from "../../config";
import {
  threeSpace, getColorFromBrightness, easyCubicBezierCurve3,
} from "../../helpers";
import { outletDepth } from "../../bot";
import * as THREE from "three";
import { Group, MeshPhongMaterial } from "../../components";

export interface UtilitiesPostProps {
  config: Config;
  activeFocus: string;
}

export const UtilitiesPost = React.memo((props: UtilitiesPostProps) => {
  const {
    utilitiesPost, legSize, bedLengthOuter, bedWidthOuter,
    bedBrightness, bedHeight, bedZOffset,
  } = props.config;
  const groundZ = React.useMemo(
    () => -bedHeight - bedZOffset,
    [bedHeight, bedZOffset],
  );
  const postColor = React.useMemo(
    () => getColorFromBrightness(bedBrightness),
    [bedBrightness],
  );
  const faucetX = 0;
  const faucetY = -115;
  const faucetZ = 70;
  const barbX = React.useMemo(
    () => -bedLengthOuter / 2 - 200,
    [bedLengthOuter],
  );
  const barbY = -100;
  const barbZ = -130;

  const hosePathCurved = React.useMemo(() => easyCubicBezierCurve3(
    [faucetX, faucetY, faucetZ],
    [0, -60, -65],
    [200, 0, 0],
    [faucetX - 205, barbY, barbZ],
  ), [barbY, barbZ]);

  const hosePathStraight = React.useMemo(() => new THREE.LineCurve3(
    new THREE.Vector3(faucetX - 200, barbY, barbZ),
    new THREE.Vector3(barbX, barbY, barbZ),
  ), [barbX, barbY, barbZ]);

  const postWoodTexture = useTexture(ASSETS.textures.wood + "?=post");
  React.useEffect(() => {
    postWoodTexture.wrapS = RepeatWrapping;
    postWoodTexture.wrapT = RepeatWrapping;
    postWoodTexture.repeat.set(0.02, 0.05);
  }, [postWoodTexture]);
  const postPosition = React.useMemo<[number, number, number]>(() => ([
    threeSpace(bedLengthOuter + 600, bedLengthOuter),
    threeSpace(legSize / 2, bedWidthOuter),
    groundZ + 150,
  ]), [bedLengthOuter, bedWidthOuter, groundZ, legSize]);
  const pipePosition = React.useMemo<[number, number, number]>(
    () => [-legSize / 2 - outletDepth / 2, 0, -50],
    [legSize],
  );
  const pipeRotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, 0], []);
  const outletPosition = React.useMemo<[number, number, number]>(
    () => [-legSize / 2 - outletDepth / 2, 0, 85],
    [legSize],
  );
  const routerPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, 165], []);
  const routerArgs = React.useMemo<[number, number, number]>(
    () => [legSize, 60, 30],
    [legSize],
  );
  const antennaArgs = React.useMemo<[number, number, number]>(
    () => [3.5, 3.5, 60],
    [],
  );
  const antennaRotationLeft = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, Math.PI / 8], []);
  const antennaRotationRight = React.useMemo<[number, number, number]>(
    () => [Math.PI / 2, 0, -Math.PI / 8], []);
  const ledArgs = React.useMemo<[number, number, number]>(
    () => [2, 2, 61],
    [],
  );
  const waterPipePosition = React.useMemo<[number, number, number]>(
    () => [0, -legSize / 2 - 20, -50],
    [legSize],
  );
  const faucetBasePosition = React.useMemo<[number, number, number]>(
    () => [0, -legSize / 2 - 20, 90],
    [legSize],
  );
  const faucetOutletPosition = React.useMemo<[number, number, number]>(
    () => [0, -legSize / 2 - 45, 90],
    [legSize],
  );
  const faucetOutletRotation = React.useMemo<[number, number, number]>(
    () => [Math.PI / 4, 0, 0], []);
  const faucetHandlePosition = React.useMemo<[number, number, number]>(
    () => [0, -legSize / 2 - 65, 105],
    [legSize],
  );
  const faucetHandleRotation = React.useMemo<[number, number, number]>(
    () => [-Math.PI / 4, 0, 0], []);
  const faucetHandleArgs = React.useMemo<[number, number, number]>(
    () => [25, 25, 10],
    [],
  );
  const faucetPinArgs = React.useMemo<[number, number, number]>(
    () => [4, 4, 15],
    [],
  );
  const hoseCurvedArgs = React.useMemo<
    [THREE.Curve<THREE.Vector3>, number, number, number]
  >(() => [hosePathCurved, 10, 15, 8], [hosePathCurved]);
  const hoseStraightArgs = React.useMemo<
    [THREE.Curve<THREE.Vector3>, number, number, number]
  >(() => [hosePathStraight, 1, 15, 8], [hosePathStraight]);

  return <Group name={"utilities"}
    visible={utilitiesPost && props.activeFocus != "Planter bed"}
    position={postPosition}>
    <Box name={"utilities-post"}
      castShadow={true}
      args={[legSize, legSize, 300]}>
      <MeshPhongMaterial map={postWoodTexture} color={postColor} />
    </Box>
    <Cylinder name={"pipe"}
      castShadow={true}
      receiveShadow={true}
      args={[outletDepth / 2, outletDepth / 2, 200]}
      position={pipePosition}
      rotation={pipeRotation}>
      <MeshPhongMaterial color={"gray"} />
    </Cylinder>
    <Box name={"electrical-outlet"}
      castShadow={true}
      args={[outletDepth, 75, 110]}
      position={outletPosition}>
      <MeshPhongMaterial color={"gray"} />
    </Box>
    <Group name={"wifi-router"}
      position={routerPosition}>
      <RoundedBox name={"router-base"}
        castShadow={true}
        receiveShadow={true}
        radius={8}
        args={routerArgs}>
        <MeshPhongMaterial color={"lightgray"} />
      </RoundedBox>
      <Cylinder name={"antenna-1"}
        castShadow={true}
        receiveShadow={true}
        args={antennaArgs}
        position={[-30, 0, 35]}
        rotation={antennaRotationLeft}>
        <MeshPhongMaterial color={"gray"} />
      </Cylinder>
      <Cylinder name={"antenna-2"}
        castShadow={true}
        receiveShadow={true}
        args={antennaArgs}
        position={[30, 0, 35]}
        rotation={antennaRotationRight}>
        <MeshPhongMaterial color={"gray"} />
      </Cylinder>
      <Cylinder name={"led-light-1"}
        castShadow={true}
        receiveShadow={true}
        args={ledArgs}
        position={[-40, 0, 5]}>
        <MeshPhongMaterial color={"green"} />
      </Cylinder>
      <Cylinder name={"led-light-2"}
        castShadow={true}
        receiveShadow={true}
        args={ledArgs}
        position={[-30, 0, 5]}>
        <MeshPhongMaterial color={"blue"} />
      </Cylinder>
    </Group>
    <Group name={"water-source"}>
      <Cylinder name={"pipe"}
        castShadow={true}
        receiveShadow={true}
        args={[18, 18, 200]}
        position={waterPipePosition}
        rotation={pipeRotation}>
        <MeshPhongMaterial color={"#f4f4f4"} />
      </Cylinder>
      <Cylinder name={"faucet-base"}
        castShadow={true}
        receiveShadow={true}
        args={[20, 20, 80]}
        position={faucetBasePosition}
        rotation={pipeRotation}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
      <Cylinder name={"faucet-outlet"}
        castShadow={true}
        receiveShadow={true}
        args={[18, 18, 70]}
        position={faucetOutletPosition}
        rotation={faucetOutletRotation}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
      <Group name={"faucet-handle"}
        position={faucetHandlePosition}
        rotation={faucetHandleRotation}>
        <Cylinder name={"handle"}
          castShadow={true}
          receiveShadow={true}
          args={faucetHandleArgs}>
          <MeshPhongMaterial color={"#0266b5"} />
        </Cylinder>
        <Cylinder name={"pin"}
          castShadow={true}
          receiveShadow={true}
          args={faucetPinArgs}>
          <MeshPhongMaterial color={"#434343"} />
        </Cylinder>
      </Group>
      <Tube name={"garden-hose-curved"}
        castShadow={true}
        receiveShadow={true}
        args={hoseCurvedArgs}>
        <MeshPhongMaterial color="darkgreen" />
      </Tube>
      <Tube name={"garden-hose-straight"}
        castShadow={true}
        receiveShadow={true}
        args={hoseStraightArgs}>
        <MeshPhongMaterial color="darkgreen" />
      </Tube>
    </Group>
  </Group>;
});
