import React from "react";
import { Billboard, Image } from "@react-three/drei";
import { Group } from "../../components";
import { Config } from "../../config";
import { threeSpace } from "../../helpers";
import { Vector3 } from "three";
import { ASSETS, RenderOrder } from "../../constants";

export interface PeopleProps {
  config: Config;
  activeFocus: string;
  people: { url: string, offset: number[] }[];
}

export const People = (props: PeopleProps) => {
  const { people, config } = props;
  const groundZ = -config.bedZOffset - config.bedHeight;
  return <Group name={"people"}
    visible={config.people && props.activeFocus == ""}>
    {people.map((person, i) => {
      const scalingData = SCALING_DATA[person.url];
      const offset = new Vector3(...person.offset);
      return <Billboard key={i}
        position={[
          threeSpace(offset.x, config.bedLengthOuter),
          threeSpace(offset.y, config.bedWidthOuter),
          groundZ,
        ]}>
        <Image
          url={person.url}
          position={new Vector3(...scalingData.position)}
          scale={scalingData.scale}
          transparent={true}
          opacity={0.4}
          renderOrder={RenderOrder.one} />
      </Billboard>;
    })}
  </Group>;
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
