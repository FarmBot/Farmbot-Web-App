import React from "react";
import { TaggedWeedPointer, Xyz } from "farmbot";
import { Config } from "../config";
import { ASSETS, HOVER_OBJECT_MODES } from "../constants";
import { Group, MeshPhongMaterial } from "../components";
import { Image, Billboard, Sphere } from "@react-three/drei";
import { DoubleSide } from "three";
import { zero as zeroFunc, threeSpace } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined } from "lodash";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode } from "../../farm_designer/map/util";

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
      if (weed.body.id && !isUndefined(props.dispatch) &&
        !HOVER_OBJECT_MODES.includes(getMode())) {
        props.dispatch(setPanelOpen(true));
        navigate(Path.weeds(weed.body.id));
      }
    }}
    position={{
      x: weed.body.x,
      y: weed.body.y,
      z: -config.soilHeight,
    }}
    config={config}
    color={weed.body.meta.color}
    radius={weed.body.radius} />;
};

interface WeedBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: () => void;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
}

export const WeedBase = (props: WeedBaseProps) => {
  const { config } = props;
  const iconSize = props.radius ? props.radius : 50;
  return <Group
    name={"weed-" + props.pointName}
    position={props.position
      ? [
        threeSpace(props.position.x, config.bedLengthOuter) + config.bedXOffset,
        threeSpace(props.position.y, config.bedWidthOuter) + config.bedYOffset,
        zeroFunc(config).z + props.position.z,
      ]
      : [0, 0, 0]}
    onClick={props.onClick}>
    <Billboard follow={true}
      position={[0, 0, iconSize / 2]}>
      <Image url={ASSETS.other.weed}
        scale={iconSize}
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
