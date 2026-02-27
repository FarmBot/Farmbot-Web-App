import React, { useMemo } from "react";
import { Tube } from "@react-three/drei";
import { MeshPhongMaterial } from "../../components";
import { TextureLoader, RepeatWrapping, Texture } from "three";
import * as threeFiber from "@react-three/fiber";
import { ASSETS } from "../../constants";

export interface WaterStreamProps extends React.ComponentProps<typeof Tube> {
  waterFlow: boolean;
}

export const useWaterFlowTexture = (waterFlow: boolean): Texture | undefined => {
  const texture = useMemo(() => {
    if (!waterFlow) { return undefined; }
    const waterTexture = new TextureLoader().load(ASSETS.textures.water);
    waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;
    return waterTexture;
  }, [waterFlow]);
  const animatedTextureRef = React.useRef<Texture | undefined>(undefined);

  React.useEffect(() => {
    animatedTextureRef.current = texture;
  }, [texture]);

  threeFiber.useFrame((_, delta) => {
    const animatedTexture = animatedTextureRef.current;
    if (animatedTexture) {
      animatedTexture.offset.x -= delta * 0.05;
    }
  });

  return texture;
};

export const WaterStream = (props: WaterStreamProps) => {
  const { waterFlow } = props;
  const waterTexture = useWaterFlowTexture(waterFlow);

  return <Tube
    {...props}
    castShadow={true}
    receiveShadow={true}
    visible={waterFlow}>
    <MeshPhongMaterial map={waterTexture} />
  </Tube>;
};
