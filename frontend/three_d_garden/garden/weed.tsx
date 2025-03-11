import React from "react";
import { TaggedWeedPointer } from "farmbot";
import { Config } from "../config";
import { ASSETS } from "../constants";
import { Group, MeshPhongMaterial } from "../components";
import { Image, Billboard, Sphere } from "@react-three/drei";
import { DoubleSide, Vector3 } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";

export interface WeedProps {
  weed: TaggedWeedPointer;
  config: Config;
  dispatch?: Function;
}

export const Weed = (props: WeedProps) => {
  const { weed, config } = props;
  const navigate = useNavigate();
  return <WeedBase
    pointName={"" + weed.body.id}
    alpha={1}
    onClick={() => {
      if (weed.body.id && !isUndefined(props.dispatch)) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.weeds(weed.body.id));
      }
    }}
    position={new Vector3(
      threeSpace(weed.body.x, config.bedLengthOuter) + config.bedXOffset,
      threeSpace(weed.body.y, config.bedWidthOuter) + config.bedYOffset,
      zeroFunc(config).z - config.soilHeight,
    )}
    color={weed.body.meta.color}
    radius={weed.body.radius} />;
};

interface WeedBaseProps {
  pointName: string;
  position?: Vector3;
  onClick?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
}

export const WeedBase = (props: WeedBaseProps) => {
  return <Group
    name={"weed-" + props.pointName}
    position={props.position}
    onClick={props.onClick}>
    <Billboard follow={true}
      position={[0, 0, props.radius / 2]}>
      <Image url={ASSETS.other.weed}
        scale={props.radius}
        transparent={true}
        opacity={1 * props.alpha}
        position={[0, 0, 0]} />
    </Billboard>
    <Sphere
      renderOrder={1}
      args={[props.radius, 8, 16]}
      position={[0, 0, 0]}>
      <MeshPhongMaterial
        color={props.color}
        side={DoubleSide}
        transparent={true}
        opacity={0.5 * props.alpha} />
    </Sphere>
  </Group>;
};
