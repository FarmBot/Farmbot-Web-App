import React from "react";
import { ASSETS } from "../constants";
import { Config } from "../config";
import { People } from "./props";
import { Group } from "../components";
import { PopInGroup } from "../progressive_load";
export { LAB_SCENE_OBJECTS } from "./scene_object_data";

export interface LabProps {
  config: Config;
  activeFocus: string;
  reveal?: boolean;
  onDetailsLoadInRest?(): void;
}

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
