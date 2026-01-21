import React, { useCallback, useMemo, useRef } from "react";
import { Tube } from "@react-three/drei";
import { MeshPhongMaterial } from "../../components";
import { TextureLoader, RepeatWrapping, Texture } from "three";
import { useFrame } from "@react-three/fiber";
import { ASSETS } from "../../constants";

const waterTexture = new TextureLoader().load(ASSETS.textures.water);
waterTexture.wrapS = waterTexture.wrapT = RepeatWrapping;
const FLOW_UPDATE_INTERVAL = 1 / 30;

export interface WaterStreamProps extends React.ComponentProps<typeof Tube> {
  waterFlow: boolean;
}

export const useWaterFlowTexture = (waterFlow: boolean): Texture | undefined => {
  const texture = useMemo(() => waterFlow ? waterTexture : undefined, [waterFlow]);
  const elapsed = useRef(0);

  const updateFlow = useCallback((_: unknown, delta: number) => {
    if (waterFlow) {
      elapsed.current += delta;
      if (elapsed.current < FLOW_UPDATE_INTERVAL) { return; }
      waterTexture.offset.x -= elapsed.current * 0.05;
      elapsed.current = 0;
    }
  }, [waterFlow]);
  useFrame(updateFlow);

  return texture;
};

export const WaterStream = React.memo((props: WaterStreamProps) => {
  const { waterFlow } = props;
  const waterTexture = useWaterFlowTexture(waterFlow);

  return <Tube
    {...props}
    castShadow={true}
    receiveShadow={true}
    visible={waterFlow}>
    <MeshPhongMaterial map={waterTexture} />
  </Tube>;
});
