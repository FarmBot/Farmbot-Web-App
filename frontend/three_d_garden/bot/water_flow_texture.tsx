import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";
import { ASSETS } from "../constants";

export const useWaterFlowTexture = (waterFlow: boolean) => {
  const waterTexture = useMemo(() => {
    const texture = new TextureLoader().load(ASSETS.textures.water);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    return texture;
  }, []);

  useFrame((_, delta) => {
    if (waterFlow) {
      waterTexture.offset.x -= delta * 0.5;
    }
  });

  return waterTexture;
};
