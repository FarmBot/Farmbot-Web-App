import React from "react";
import { ASSETS } from "../constants";
import { Config } from "../config";
import { Group } from "../components";
import { People } from "./props";
import { PopInGroup } from "../progressive_load";
import { type PlantIconAtlas } from "../garden/plant_icon_atlas";
export { GREENHOUSE_SCENE_OBJECTS } from "./scene_object_data";

export interface GreenhouseProps {
  config: Config;
  activeFocus: string;
  reveal?: boolean;
  plantIconAtlas?: PlantIconAtlas;
  onDetailsLoadInRest?(): void;
}

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
