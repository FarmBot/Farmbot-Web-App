import React, { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";
import { Cylinder, Tube } from "@react-three/drei";
import { Config } from "../config";
import { threeSpace, easyCubicBezierCurve3 } from "../helpers";
import { Group, MeshPhongMaterial } from "../components";
import { ASSETS } from "../constants";

export interface XAxisWaterTubeProps {
  config: Config;
}

export const XAxisWaterTube = (props: XAxisWaterTubeProps) => {
  const { config } = props;
  const groundZ = -config.bedHeight - config.bedZOffset;
  const barbX = threeSpace(config.bedLengthOuter / 2 + 400, config.bedLengthOuter);
  const barbY = threeSpace(-50, config.bedWidthOuter);
  const barbZ = groundZ + 20;
  const tubePath = easyCubicBezierCurve3(
    [
      threeSpace(config.bedLengthOuter / 2 - 20, config.bedLengthOuter),
      threeSpace(-30, config.bedWidthOuter),
      -140,
    ],
    [300, 0, 0],
    [-300, 0, 0],
    [barbX, barbY, barbZ],
  );

  const [waterTexture, setWaterTexture] = useState(() => {
    const texture = new TextureLoader().load(ASSETS.textures.water);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    return texture;
  });

  useEffect(() => {
    const newTexture = new TextureLoader().load(ASSETS.textures.water);
    newTexture.wrapS = newTexture.wrapT = RepeatWrapping;
    setWaterTexture(newTexture);
  }, [config]);

  useFrame((_, delta) => {
    if (config.waterFlow && waterTexture) {
      waterTexture.offset.x += delta * 0.5;
    }
  });

  return (
    <Group key={config.waterFlow ? "flowing" : "static"}>
      <Tube name={"x-axis-water-tube"}
        castShadow={true}
        receiveShadow={true}
        args={[tubePath, 20, 5, 8]}>
        <MeshPhongMaterial
          map={config.waterFlow ? waterTexture : null}
          transparent={true}
          opacity={config.waterFlow ? 0.75 : 0.5} />
      </Tube>
      <Cylinder name={"adapter-barb"}
        receiveShadow={true}
        args={[3.5, 3.5, 20]}
        position={[barbX - 10, barbY, barbZ]}
        rotation={[0, 0, Math.PI / 2]}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
      <Cylinder name={"adapter-base"}
        receiveShadow={true}
        args={[18, 18, 20]}
        position={[barbX + 10, barbY, barbZ]}
        rotation={[0, 0, Math.PI / 2]}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
    </Group>
  );
};
