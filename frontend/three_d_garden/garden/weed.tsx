import React from "react";
import { TaggedWeedPointer } from "farmbot";
import { Config } from "../config";
import { ASSETS } from "../constants";
import { Group, MeshPhongMaterial } from "../components";
import { Image, Billboard, Sphere } from "@react-three/drei";
import { DoubleSide } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";

export interface WeedProps {
  weed: TaggedWeedPointer;
  config: Config;
}

export const Weed = (props: WeedProps) => {
  const { weed, config } = props;
  const navigate = useNavigate();
  return <Group name={"weed"}
    onClick={() => {
      weed.body.id && navigate(Path.weeds(weed.body.id));
    }}
    position={[
      threeSpace(weed.body.x, config.bedLengthOuter) + config.bedXOffset,
      threeSpace(weed.body.y, config.bedWidthOuter) + config.bedYOffset,
      zeroFunc(config).z - config.soilHeight,
    ]}>
    <Billboard follow={true}
      position={[0, 0, weed.body.radius / 2]}>
      <Image url={ASSETS.other.weed}
        scale={weed.body.radius}
        transparent={true}
        position={[0, 0, 0]} />
    </Billboard>
    <Sphere
      renderOrder={1}
      args={[weed.body.radius, 8, 16]}
      position={[0, 0, 0]}>
      <MeshPhongMaterial
        color={weed.body.meta.color}
        side={DoubleSide}
        transparent={true}
        opacity={0.5} />
    </Sphere>
  </Group>;
};
