import React from "react";
import * as THREE from "three";
import { Cloud, Clouds } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { ASSETS } from "../../constants";

export interface SuctionAnimationProps {
  z: number;
}

export interface SuctionAnimationsProps {
  zValues: number[];
}

export const SuctionAnimations = (props: SuctionAnimationsProps) => {
  const airRefs = React.useRef<(THREE.Group | undefined)[]>([]);
  const target = React.useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const direction = React.useMemo(() => new THREE.Vector3(), []);

  const setAirRef = React.useCallback((
    index: number,
    air: THREE.Group | null,
  ) => {
    airRefs.current[index] = air || undefined;
  }, []);

  useFrame(() => {
    airRefs.current.forEach(air => {
      if (!air) { return; }
      const { position } = air;
      direction.copy(target).sub(position);
      const distance = direction.length();
      const normalizedDist = distance / 100;
      const speed = (10 - 9 * normalizedDist) / 2;

      position.add(direction.normalize().multiplyScalar(speed));

      if (distance < 10) {
        position.z = -100;
      }

      const scale = 2 * normalizedDist;
      air.scale.set(scale, scale, scale);
    });
  });

  return <Clouds name={"waterfall-mist"}
    texture={ASSETS.textures.cloud}>
    {props.zValues.map((z, index) =>
      <Cloud name={"suction-cloud"}
        key={z}
        ref={air => setAirRef(index, air)}
        position={[0, 0, z]}
        bounds={[10, 10, 10]}
        segments={1}
        volume={25}
        color={"white"}
        speed={0}
        scale={0}
        opacity={0.25} />)}
  </Clouds>;
};

export const SuctionAnimation = (props: SuctionAnimationProps) =>
  <SuctionAnimations zValues={[props.z]} />;
