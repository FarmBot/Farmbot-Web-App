import React from "react";
import { ASSETS } from "../constants";
import { Config } from "../config";
import { People } from "./props";
import { Group } from "../components";
import { PopInGroup } from "../progressive_load";
import { SceneObject } from "farmbot/dist/resources/api_resources";

export interface LabProps {
  config: Config;
  activeFocus: string;
  reveal?: boolean;
  onDetailsLoadInRest?(): void;
}

export const LAB_SCENE_OBJECTS: SceneObject[] = [
  {
    name: "Wall Y",
    texture: "none",
    shape: "box",
    color: "#f4f4f4",
    show: true,
    x_center: -2250,
    y_center: -1600,
    z_base: 0,
    x_size: 200,
    y_size: 10000,
    z_size: 2500,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Wall X",
    texture: "none",
    shape: "box",
    color: "#f4f4f4",
    show: true,
    x_center: 2750,
    y_center: 3470,
    z_base: 0,
    x_size: 10200,
    y_size: 200,
    z_size: 2500,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Lower Shelf",
    texture: "wood",
    shape: "box",
    color: "#999",
    show: true,
    x_center: 2850,
    y_center: 3270,
    z_base: 810,
    x_size: 10000,
    y_size: 200,
    z_size: 50,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Upper Shelf",
    texture: "wood",
    shape: "box",
    color: "#999",
    show: true,
    x_center: 2850,
    y_center: 3270,
    z_base: 1230,
    x_size: 10000,
    y_size: 200,
    z_size: 50,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Desk",
    texture: "wood",
    shape: "desk",
    color: "#666",
    show: true,
    x_center: 850,
    y_center: 0,
    z_base: 0,
    x_size: 500,
    y_size: 1000,
    z_size: 600,
    x_origin: "max",
    y_origin: "world",
    z_origin: "world",
  },
  {
    name: "Laptop",
    texture: "none",
    shape: "laptop",
    color: "#fff",
    show: true,
    x_center: 800,
    y_center: 0,
    z_base: 600,
    x_size: 300,
    y_size: 300,
    z_size: 200,
    x_origin: "max",
    y_origin: "world",
    z_origin: "world",
  },
];

const LabBase = (props: LabProps) => {
  if (props.config.scene != "Lab") { return <></>; }
  return <EnabledLab {...props} />;
};

const EnabledLab = (props: LabProps) => {
  const { config } = props;

  return <Group name={"lab-environment"} visible={config.scene == "Lab"}>
    <PopInGroup
      name={"lab-scene-details-load-in"}
      reveal={props.reveal}
      onRest={props.onDetailsLoadInRest}
      distance={300}>
      <People
        activeFocus={props.activeFocus}
        config={config}
        people={[
          {
            url: ASSETS.people.person1Flipped,
            offset: [-300, -300],
          },
          {
            url: ASSETS.people.person2Flipped,
            offset: [config.bedLengthOuter / 2, config.bedWidthOuter + 500],
          },
        ]} />
    </PopInGroup>
  </Group>;
};

const LAB_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "people",
  "scene",
];

export const labPropsEqual = (prev: LabProps, next: LabProps) =>
  prev.activeFocus === next.activeFocus
  && prev.reveal === next.reveal
  && prev.onDetailsLoadInRest === next.onDetailsLoadInRest
  && LAB_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Lab = React.memo(LabBase, labPropsEqual);
