import React, { useMemo } from "react";
import { Tube } from "@react-three/drei";
import { MeshPhongMaterial } from "../../components";
import { TextureLoader, RepeatWrapping, Texture } from "three";
import { useFrame } from "@react-three/fiber";
import { ASSETS } from "../../constants";

const waterTexture = new TextureLoader().load(ASSETS.textures.water);
waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;

export interface WaterStreamProps {
  name: string;
  args: Parameters<typeof Tube>[0]["args"];
  waterFlow: boolean;
}

export const useWaterFlowTexture = (waterFlow: boolean): Texture | undefined => {
  const texture = useMemo(() => waterFlow ? waterTexture : undefined, [waterFlow]);

  useFrame((_, delta) => {
    if (waterFlow) {
      waterTexture.offset.x -= delta * 0.05;
    }
  });

  return texture;
};

export const WaterStream = (props: WaterStreamProps) => {
  const { name, args, waterFlow } = props;
  const waterTexture = useWaterFlowTexture(waterFlow);

  return <Tube name={name}
    castShadow={true}
    receiveShadow={true}
    args={args}
    visible={waterFlow}>
    <MeshPhongMaterial map={waterTexture} />
  </Tube>;
};
