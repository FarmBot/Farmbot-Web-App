import React from "react";
import { Config } from "../config";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import { Billboard, Plane, useTexture } from "@react-three/drei";
import { Vector3, Mesh, Group as GroupType } from "three";
import { threeSpace, zZero as zZeroFunc } from "../helpers";
import { Text } from "../elements";
import { isUndefined } from "lodash";
import { Path } from "../../internal_urls";
import { useNavigate } from "react-router";
import { setPanelOpen } from "../../farm_designer/panel_header";
import { getMode } from "../../farm_designer/map/util";
import { ThreeElements, useFrame } from "@react-three/fiber";
import { getSizeAtTime } from "../../promo/plants";
import { FixedNormalMaterial } from "./fixed_normal_material";

export interface ThreeDGardenPlant {
  id?: number | undefined;
  label: string;
  icon: string;
  size: number;
  spread: number;
  x: number;
  y: number;
  key: string;
  seed: number;
}

export interface ThreeDPlantProps {
  plant: ThreeDGardenPlant;
  i: number;
  labelOnly?: boolean;
  config: Config;
  hoveredPlant: number | undefined;
  dispatch?: Function;
  visible?: boolean;
  getZ(x: number, y: number): number;
  startTimeRef?: React.RefObject<number>;
}

export const ThreeDPlant = (props: ThreeDPlantProps) => {
  const { i, plant, labelOnly, config, hoveredPlant } = props;
  const alwaysShowLabels = config.labels && !config.labelsOnHover;
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const billboardRef = React.useRef<GroupType>(null);
  const getPlantZ = (size: number) =>
    zZeroFunc(config)
    + props.getZ(plant.x - config.bedXOffset, plant.y - config.bedYOffset)
    + size / 2;
  return <Billboard
    ref={billboardRef}
    follow={true}
    position={new Vector3(
      threeSpace(plant.x, config.bedLengthOuter),
      threeSpace(plant.y, config.bedWidthOuter),
      getPlantZ(plant.size),
    )}>
    {labelOnly
      ? <Text visible={alwaysShowLabels || i === hoveredPlant}
        renderOrder={RenderOrder.plantLabels}
        fontSize={50}
        color={"white"}
        position={[0, plant.size / 2 + 40, 0]}
        rotation={[0, 0, 0]}>
        {plant.label}
      </Text>
      : <Image i={i}
        plant={plant}
        billboardRef={billboardRef}
        getPlantZ={getPlantZ}
        url={plant.icon}
        startTimeRef={props.startTimeRef}
        animateSeasons={props.config.animateSeasons}
        season={config.plants}
        onClick={() => {
          if (plant.id && !isUndefined(props.dispatch) && props.visible &&
            !HOVER_OBJECT_MODES.includes(getMode())) {
            props.dispatch(setPanelOpen(true));
            navigate(Path.plants(plant.id));
          }
        }} />}
  </Billboard>;
};

type MeshProps = ThreeElements["mesh"];
interface CustomImageProps extends MeshProps {
  url: string;
  plant: ThreeDGardenPlant;
  i: number;
  onClick?: () => void;
  getPlantZ(size: number): number;
  season: string;
  startTimeRef?: React.RefObject<number>;
  animateSeasons: boolean;
  billboardRef: React.RefObject<GroupType | null>;
}

const Image = (props: CustomImageProps) => {
  const texture = useTexture(props.url);

  const { plant } = props;
  // eslint-disable-next-line no-null/no-null
  const imgRef = React.useRef<Mesh>(null);

  useFrame(() => {
    if (!props.animateSeasons || !props.startTimeRef) { return; }

    if (imgRef.current && props.billboardRef.current) {
      const currentTime = performance.now() / 1000;
      const t = currentTime - props.startTimeRef.current;
      const scale = plant.size * getSizeAtTime(plant, props.season, t);
      imgRef.current.scale.set(scale, scale, scale);
      props.billboardRef.current.position.z = props.getPlantZ(scale);
    }
  });

  return <Plane {...props}
    ref={imgRef}
    scale={(!props.animateSeasons || !props.startTimeRef) ? plant.size : 0}
    name={"" + props.i}
    onClick={props.onClick}
    renderOrder={RenderOrder.plants}
    args={[1, 1]}>
    <FixedNormalMaterial
      key={Math.random()}
      map={texture}
      roughness={0}
      metalness={0}
      transparent={true} />
  </Plane>;
};
