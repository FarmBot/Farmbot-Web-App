import React, { useMemo } from "react";
import { Tube } from "@react-three/drei";
import { Mesh, MeshPhongMaterial } from "../../components";
import {
  Curve, TextureLoader, RepeatWrapping, Texture, Vector3,
} from "three";
import * as threeFiber from "@react-three/fiber";
import { ASSETS } from "../../constants";
import { useManagedTubeGeometry } from "./managed_tube_geometry";

export interface WaterStreamProps extends React.ComponentProps<typeof Tube> {
  waterFlow: boolean;
  waterTexture?: Texture;
}

const WaterFlowTextureContext = React.createContext<Texture | undefined>(undefined);

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

interface WaterFlowTextureProviderProps {
  waterFlow: boolean;
  children: React.ReactNode;
}

export const WaterFlowTextureProvider =
  (props: WaterFlowTextureProviderProps) => {
    const waterTexture = useWaterFlowTexture(props.waterFlow);
    return <WaterFlowTextureContext.Provider value={waterTexture}>
      {props.children}
    </WaterFlowTextureContext.Provider>;
  };

export const useSharedWaterFlowTexture = () =>
  React.useContext(WaterFlowTextureContext);

export const WaterStream = (props: WaterStreamProps) => {
  const { waterFlow, waterTexture, ...tubeProps } = props;
  const name = "" + props.name;
  const [path, tubularSegments = 64, radius = 1,
    radialSegments = 8] = tubeProps.args as unknown as [
      Curve<Vector3>, number?, number?, number?,
    ];
  const geometry = useManagedTubeGeometry(
    path,
    tubularSegments,
    radius,
    radialSegments,
    name.startsWith("water-stream-")
      ? "bot.geometry.waterSpray"
      : "bot.geometry.tube.solenoidStream",
  );
  const { args: _args, ...meshProps } = tubeProps;

  return <Mesh
    {...meshProps}
    geometry={geometry}
    castShadow={true}
    receiveShadow={true}
    visible={waterFlow}>
    <MeshPhongMaterial map={waterTexture} />
  </Mesh>;
};
