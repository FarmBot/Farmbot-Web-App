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

export const UtilitiesPost = (props: UtilitiesPostProps) => {
  const {
    utilitiesPost, legSize, bedLengthOuter, bedWidthOuter,
    bedBrightness, bedHeight, bedZOffset,
  } = props.config;
  const groundZ = -bedHeight - bedZOffset;
  const postColor = getColorFromBrightness(bedBrightness);
  const faucetX = 0;
  const faucetY = -115;
  const faucetZ = 70;
  const barbX = -bedLengthOuter / 2 - 200;
  const barbY = -100;
  const barbZ = -130;

  const hosePathCurved = easyCubicBezierCurve3(
    [faucetX, faucetY, faucetZ],
    [0, -60, -65],
    [200, 0, 0],
    [faucetX - 205, barbY, barbZ],
  );

  const hosePathStraight = new THREE.LineCurve3(
    new THREE.Vector3(faucetX - 200, barbY, barbZ),
    new THREE.Vector3(barbX, barbY, barbZ),
  );

  const postWoodTexture = useTexture(ASSETS.textures.wood + "?=post");
  postWoodTexture.wrapS = RepeatWrapping;
  postWoodTexture.wrapT = RepeatWrapping;
  postWoodTexture.repeat.set(0.02, 0.05);

  return <Group name={"utilities"}
    visible={utilitiesPost && props.activeFocus != "Planter bed"}
    position={[
      threeSpace(bedLengthOuter + 600, bedLengthOuter),
      threeSpace(legSize / 2, bedWidthOuter),
      groundZ + 150,
    ]}>
    <Box name={"utilities-post"}
      castShadow={true}
      args={[legSize, legSize, 300]}>
      <MeshPhongMaterial map={postWoodTexture} color={postColor} />
    </Box>
    <Cylinder name={"pipe"}
      castShadow={true}
      receiveShadow={true}
      args={[outletDepth / 2, outletDepth / 2, 200]}
      position={[-legSize / 2 - outletDepth / 2, 0, -50]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"gray"} />
    </Cylinder>
    <Box name={"electrical-outlet"}
      castShadow={true}
      args={[outletDepth, 75, 110]}
      position={[-legSize / 2 - outletDepth / 2, 0, 85]}>
      <MeshPhongMaterial color={"gray"} />
    </Box>
    <Group name={"wifi-router"}
      position={[0, 0, 165]}>
      <RoundedBox name={"router-base"}
        castShadow={true}
        receiveShadow={true}
        radius={8}
        args={[legSize, 60, 30]}>
        <MeshPhongMaterial color={"lightgray"} />
      </RoundedBox>
      <Cylinder name={"antenna-1"}
        castShadow={true}
        receiveShadow={true}
        args={[3.5, 3.5, 60]}
        position={[-30, 0, 35]}
        rotation={[Math.PI / 2, 0, Math.PI / 8]}>
        <MeshPhongMaterial color={"gray"} />
      </Cylinder>
      <Cylinder name={"antenna-2"}
        castShadow={true}
        receiveShadow={true}
        args={[3.5, 3.5, 60]}
        position={[30, 0, 35]}
        rotation={[Math.PI / 2, 0, -Math.PI / 8]}>
        <MeshPhongMaterial color={"gray"} />
      </Cylinder>
      <Cylinder name={"led-light-1"}
        castShadow={true}
        receiveShadow={true}
        args={[2, 2, 61]}
        position={[-40, 0, 5]}>
        <MeshPhongMaterial color={"green"} />
      </Cylinder>
      <Cylinder name={"led-light-2"}
        castShadow={true}
        receiveShadow={true}
        args={[2, 2, 61]}
        position={[-30, 0, 5]}>
        <MeshPhongMaterial color={"blue"} />
      </Cylinder>
    </Group>
    <Group name={"water-source"}>
      <Cylinder name={"pipe"}
        castShadow={true}
        receiveShadow={true}
        args={[18, 18, 200]}
        position={[0, -legSize / 2 - 20, -50]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"#f4f4f4"} />
      </Cylinder>
      <Cylinder name={"faucet-base"}
        castShadow={true}
        receiveShadow={true}
        args={[20, 20, 80]}
        position={[0, -legSize / 2 - 20, 90]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
      <Cylinder name={"faucet-outlet"}
        castShadow={true}
        receiveShadow={true}
        args={[18, 18, 70]}
        position={[0, -legSize / 2 - 45, 90]}
        rotation={[Math.PI / 4, 0, 0]}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
      <Group name={"faucet-handle"}
        position={[0, -legSize / 2 - 65, 105]}
        rotation={[-Math.PI / 4, 0, 0]}>
        <Cylinder name={"handle"}
          castShadow={true}
          receiveShadow={true}
          args={[25, 25, 10]}>
          <MeshPhongMaterial color={"#0266b5"} />
        </Cylinder>
        <Cylinder name={"pin"}
          castShadow={true}
          receiveShadow={true}
          args={[4, 4, 15]}>
          <MeshPhongMaterial color={"#434343"} />
        </Cylinder>
      </Group>
      <Tube name={"garden-hose-curved"}
        castShadow={true}
        receiveShadow={true}
        args={[hosePathCurved, 10, 15, 8]}>
        <MeshPhongMaterial color="darkgreen" />
      </Tube>
      <Tube name={"garden-hose-straight"}
        castShadow={true}
        receiveShadow={true}
        args={[hosePathStraight, 1, 15, 8]}>
        <MeshPhongMaterial color="darkgreen" />
      </Tube>
    </Group>
  </Group>;
};
