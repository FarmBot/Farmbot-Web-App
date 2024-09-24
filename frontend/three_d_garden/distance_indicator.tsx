import React from "react";
import { Box, Text } from "@react-three/drei";
import { ASSETS } from "./constants";
import { Arrow } from "./arrow";
import { Group, MeshPhongMaterial } from "./components";

export interface DistanceIndicatorProps {
  start: Record<"x" | "y" | "z", number>;
  end: Record<"x" | "y" | "z", number>;
  visible?: boolean;
}

export const DistanceIndicator = (props: DistanceIndicatorProps) => {
  const { start, end } = props;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const distance = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const midZ = (start.z + end.z) / 2;
  const angleY = Math.atan2(dz, dx);
  const angleZ = Math.atan2(dy, dx);
  return <Group visible={props.visible}
    position={[midX, midY, midZ]}
    rotation={[0, -angleY, angleZ]}>
    <Arrow length={distance / 2} width={25} />
    <Arrow length={distance / 2} width={25} rotation={[0, 0, Math.PI]} />
    <Group rotation={[Math.PI / 6, 0, 0]}>
      <Box
        args={[300, 100, 75]}
        receiveShadow={true}>
        <MeshPhongMaterial color={"#c49f7a"} />
      </Box>
      <Text name={"distance-label"}
        fontSize={50}
        font={ASSETS.fonts.cabinBold}
        color={"black"}
        strokeColor={"black"}
        strokeWidth={7}
        fontWeight={"bold"}
        position={[0, 0, 38]}>
        {distance.toFixed(0)}mm
      </Text>
    </Group>
  </Group>;
};
