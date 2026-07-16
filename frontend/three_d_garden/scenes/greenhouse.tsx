import React from "react";
import { ASSETS } from "../constants";
import { Config } from "../config";
import { Group } from "../components";
import { People } from "./props";
import { PopInGroup } from "../progressive_load";
import { type PlantIconAtlas } from "../garden/plant_icon_atlas";
import { SceneObject } from "farmbot/dist/resources/api_resources";

export interface GreenhouseProps {
  config: Config;
  activeFocus: string;
  reveal?: boolean;
  plantIconAtlas?: PlantIconAtlas;
  onDetailsLoadInRest?(): void;
}

export const GREENHOUSE_SCENE_OBJECTS: SceneObject[] = [
  {
    name: "Wall Y",
    texture: "none",
    shape: "window",
    color: "#f4f4f4",
    show: true,
    x_center: -2150,
    y_center: -1600,
    z_base: 0,
    x_size: 10,
    y_size: 10000,
    z_size: 2500,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Wall X",
    texture: "none",
    shape: "window",
    color: "#f4f4f4",
    show: true,
    x_center: 2850,
    y_center: 3370,
    z_base: 0,
    x_size: 10000,
    y_size: 10,
    z_size: 2500,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Potted Plant",
    texture: "none",
    shape: "plant",
    color: "#ffffff",
    show: true,
    x_center: -1920,
    y_center: 2200,
    z_base: 0,
    x_size: 500,
    y_size: 500,
    z_size: 900,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Shelf",
    texture: "wood",
    shape: "box",
    color: "#aaa",
    show: true,
    x_center: 2850,
    y_center: 3070,
    z_base: 775,
    x_size: 10000,
    y_size: 600,
    z_size: 50,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Starter Tray 1",
    texture: "none",
    shape: "tray",
    color: "#ffffff",
    show: true,
    x_center: -150,
    y_center: 3060,
    z_base: 825,
    x_size: 700,
    y_size: 250,
    z_size: 90,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
  {
    name: "Starter Tray 2",
    texture: "none",
    shape: "tray",
    color: "#ffffff",
    show: true,
    x_center: 850,
    y_center: 3060,
    z_base: 825,
    x_size: 700,
    y_size: 250,
    z_size: 90,
    x_origin: "home",
    y_origin: "home",
    z_origin: "world",
  },
];

const GreenhouseBase = (props: GreenhouseProps) => {
  if (props.config.scene != "Greenhouse") { return <></>; }
  return <EnabledGreenhouse {...props} />;
};

const EnabledGreenhouse = (props: GreenhouseProps) => {
  const { config } = props;
  return <Group
    name={"greenhouse-environment"}
    visible={config.scene == "Greenhouse"}>
    <PopInGroup
      name={"greenhouse-scene-details-load-in"}
      reveal={props.reveal}
      onRest={props.onDetailsLoadInRest}
      distance={300}>
      <People
        activeFocus={props.activeFocus}
        config={config}
        people={[
          {
            url: ASSETS.people.person3,
            offset: [-400, -400],
          },
          {
            url: ASSETS.people.person4Flipped,
            offset: [0, config.bedWidthOuter + 900],
          },
        ]} />
    </PopInGroup>
  </Group>;
};

const GREENHOUSE_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "people",
  "scene",
];

export const greenhousePropsEqual = (
  prev: GreenhouseProps,
  next: GreenhouseProps,
) =>
  prev.activeFocus === next.activeFocus
  && prev.reveal === next.reveal
  && prev.plantIconAtlas === next.plantIconAtlas
  && prev.onDetailsLoadInRest === next.onDetailsLoadInRest
  && GREENHOUSE_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

export const Greenhouse = React.memo(GreenhouseBase, greenhousePropsEqual);
