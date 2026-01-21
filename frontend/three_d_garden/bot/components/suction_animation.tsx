import React from "react";
import * as THREE from "three";
import { Cloud, Clouds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ASSETS } from "../../constants";

export interface SuctionAnimationProps {
  z: number;
}

export const SuctionAnimation = React.memo((props: SuctionAnimationProps) => {
  // eslint-disable-next-line no-null/no-null
  const airRef = React.useRef<THREE.Group>(null);
  const target = React.useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const direction = React.useMemo(() => new THREE.Vector3(), []);
  const startPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, props.z], [props.z]);
  const bounds = React.useMemo<[number, number, number]>(
    () => [10, 10, 10], []);

  const updateSuction = React.useCallback(() => {
    if (airRef.current) {
      const { position } = airRef.current;
      direction.copy(target).sub(position);
      const distance = direction.length();
      const normalizedDist = distance / 100;
      const speed = (10 - 9 * normalizedDist) / 2;

      position.add(direction.normalize().multiplyScalar(speed));

      if (distance < 10) {
        position.z = -100;
      }

      const scale = 2 * normalizedDist;
      airRef.current.scale.set(scale, scale, scale);
    }
  }, [direction, target]);
  useFrame(updateSuction);

  return <Clouds name={"waterfall-mist"}
    texture={ASSETS.textures.cloud}>
    <Cloud name={"suction-cloud"}
      ref={airRef}
      position={startPosition}
      bounds={bounds}
      segments={1}
      volume={25}
      color={"white"}
      speed={0}
      scale={0}
      opacity={0.25} />
  </Clouds>;
});
