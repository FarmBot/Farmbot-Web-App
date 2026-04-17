import React from "react";
import { Config } from "./config";
import { getDefaultCameraPosition } from "./camera";
import { Cylinder, Sphere } from "@react-three/drei";
import { Group, MeshPhongMaterial } from "./components";
import { uniq } from "lodash";
import { setWebAppConfigValue } from "../config_storage/actions";
import { NumericSetting } from "../session_keys";
import { Person } from "./scenes/props";
import { ASSETS } from "./constants";

export interface CameraSelectionUIProps {
  config: Config;
  dispatch: Function | undefined;
}

export const CameraSelectionUI = (props: CameraSelectionUIProps) => {
  const { config } = props;
  const [hovered, setHovered] = React.useState<number | undefined>(undefined);
  return <Group
    name={"camera-selection"}
    visible={config.cameraSelectionView}>
    {uniq([0, 90, 180, 270, config.viewpointHeading]).map(angle => {
      const selected = angle == config.viewpointHeading;
      const baseColor = selected ? "blue" : "orange";
      const color = hovered == angle ? "cyan" : baseColor;
      const position = getDefaultCameraPosition(angle, config.topDown);
      const scaledPosition = position.map(p => p * 0.33) as [number, number, number];
      const height = scaledPosition[2] + config.bedHeight;
      return <Group
        key={angle}
        position={scaledPosition}
        onPointerOver={() => setHovered(angle)}
        onPointerOut={() => setHovered(undefined)}
        onClick={() => props.dispatch &&
          props.dispatch(setWebAppConfigValue(
            NumericSetting.viewpoint_heading, angle))}>
        <Sphere
          name={"head"}
          args={[150, 32, 32]}>
          <MeshPhongMaterial
            transparent={true}
            opacity={1}
            color={color} />
        </Sphere>
        <Cylinder
          name={"body"}
          args={[50, 125, height]}
          position={[0, 0, -height / 2]}
          rotation={[Math.PI / 2, 0, 0]}>
          <MeshPhongMaterial
            transparent={true}
            opacity={0.9}
            color={color} />
        </Cylinder>
        <Person
          url={ASSETS.people.person2}
          position={[0, 0, -height]}
          rotation={[Math.PI / 2, 0, 0]} />
      </Group>;
    })}
  </Group>;
};
