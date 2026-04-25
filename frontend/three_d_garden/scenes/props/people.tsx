import React from "react";
import { Billboard, Image } from "@react-three/drei";
import { Group } from "../../components";
import { Config } from "../../config";
import { threeSpace } from "../../helpers";
import { Vector3, DoubleSide } from "three";
import { ASSETS, RenderOrder } from "../../constants";
import { FocusVisibilityGroup } from "../../focus_transition";

export interface PeopleProps {
  config: Config;
  activeFocus: string;
  people: { url: string, offset: number[] }[];
}

export const People = (props: PeopleProps) => {
  const { people, config } = props;
  const groundZ = -config.bedZOffset - config.bedHeight;
  return <FocusVisibilityGroup name={"people"}
    visible={config.people && props.activeFocus == ""}>
    {people.map((person, i) => {
      const offset = new Vector3(...person.offset);
      return <Billboard key={i}
        position={[
          threeSpace(offset.x, config.bedLengthOuter),
          threeSpace(offset.y, config.bedWidthOuter),
          groundZ,
        ]}>
        <Person url={person.url} />
      </Billboard>;
    })}
  </FocusVisibilityGroup>;
};

interface DataRecord {
  scale: [number, number];
  position: number[];
}

const SCALING_DATA: Record<string, DataRecord> = {
  [ASSETS.people.person1]: { scale: [900, 1800], position: [0, 900, 0] },
  [ASSETS.people.person1Flipped]: { scale: [900, 1800], position: [0, 900, 0] },
  [ASSETS.people.person2]: { scale: [700, 1700], position: [0, 850, 0] },
  [ASSETS.people.person2Flipped]: { scale: [700, 1700], position: [0, 850, 0] },
  [ASSETS.people.person3]: { scale: [875, 1800], position: [0, 900, 0] },
  [ASSETS.people.person3Flipped]: { scale: [875, 1800], position: [0, 900, 0] },
  [ASSETS.people.person4]: { scale: [580, 1700], position: [0, 850, 0] },
  [ASSETS.people.person4Flipped]: { scale: [580, 1700], position: [0, 850, 0] },
};

export interface PersonProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const Person = (props: PersonProps) => {
  const scalingData = SCALING_DATA[props.url];
  return <Group
    position={props.position}
    rotation={props.rotation}>
    <Image
      url={props.url}
      position={new Vector3(...scalingData.position)}
      scale={scalingData.scale}
      transparent={true}
      side={DoubleSide}
      opacity={0.4}
      raycast={() => undefined}
      renderOrder={RenderOrder.clouds} />
  </Group>;
};
