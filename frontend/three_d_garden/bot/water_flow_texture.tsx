import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { TextureLoader, RepeatWrapping } from "three";
import { ASSETS } from "../constants";

export const useWaterFlowTexture = (waterFlow: boolean) => {
  const [waterTexture, setWaterTexture] = useState(() => {
    const texture = new TextureLoader().load(ASSETS.textures.water);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    return texture;
  });

  useEffect(() => {
    const newTexture = new TextureLoader().load(ASSETS.textures.water);
    newTexture.wrapS = newTexture.wrapT = RepeatWrapping;
    setWaterTexture(newTexture);
  }, [waterFlow]);

  useFrame((_, delta) => {
    if (waterFlow && waterTexture) {
      waterTexture.offset.x -= delta * 0.5;
    }
  });

  return waterTexture;
};
