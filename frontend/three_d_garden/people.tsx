import React from "react";
import { Billboard, Image } from "@react-three/drei";
import { Group } from "./components";
import { Config } from "./config";
import { threeSpace } from "./helpers";
import { Vector3 } from "three";


export interface PeopleProps {
  config: Config;
  activeFocus: string;
  people: { url: string, offset: Vector3 }[];
}

export const People = (props: PeopleProps) => {
  const { people, config } = props;
  const groundZ = -config.bedZOffset - config.bedHeight;
  return <Group name={"people"}
    visible={config.people && props.activeFocus == ""}>
    {people[0] &&
      <Billboard
        position={[
          threeSpace(people[0].offset.x, config.bedLengthOuter),
          threeSpace(people[0].offset.y, config.bedWidthOuter),
          groundZ,
        ]}>
        <Image
          url={people[0].url}
          position={[0, 900, 0]}
          scale={[900, 1800]}
          transparent={true}
          opacity={0.4}
          renderOrder={1} />
      </Billboard>}
    {people[1] &&
      <Billboard
        position={[
          threeSpace(people[1].offset.x, config.bedLengthOuter),
          threeSpace(people[1].offset.y, config.bedWidthOuter),
          groundZ,
        ]}>
        <Image
          url={people[1].url}
          position={[0, 850, 0]}
          scale={[700, 1700]}
          transparent={true}
          opacity={0.4}
          renderOrder={1} />
      </Billboard>}
  </Group>;
};
