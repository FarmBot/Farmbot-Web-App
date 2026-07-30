import React from "react";
import { Billboard } from "@react-three/drei";
import { round } from "lodash";
import { Text } from "../../elements";
import { ControlPoint, CONTROL_RENDER_ORDER } from "../../controls";

export interface PlacementCoordinates {
  x: number;
  y: number;
  z: number;
}

export interface PlacementCoordinateLabelController {
  update(coordinates: PlacementCoordinates): void;
}

export type PlacementCoordinateLabelRef =
  React.RefObject<PlacementCoordinateLabelController | null>;

export const placementCoordinateLabelText = (
  coordinates: PlacementCoordinates,
) =>
  `(${round(coordinates.x, 1)}, ${round(coordinates.y, 1)})`;

interface PlacementCoordinateLabelProps {
  coordinates?: PlacementCoordinates;
  position: ControlPoint;
  visible?: boolean;
}

export const PlacementCoordinateLabel = React.forwardRef<
  PlacementCoordinateLabelController,
  PlacementCoordinateLabelProps
>((props, ref) => {
  const [liveCoordinates, setLiveCoordinates] =
    React.useState<PlacementCoordinates>();
  React.useImperativeHandle(ref, () => ({
    update: setLiveCoordinates,
  }), []);
  const coordinates = props.coordinates || liveCoordinates;
  if (!coordinates) { return <></>; }
  return <Billboard
    follow={true}
    position={props.position}
    visible={props.visible}>
    <Text
      name={"placement-coordinate-label"}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      fontSize={34}
      color={"white"}
      transparent={true}
      depthTest={false}
      depthWrite={false}
      renderOrder={CONTROL_RENDER_ORDER}>
      {placementCoordinateLabelText(coordinates)}
    </Text>
  </Billboard>;
});

PlacementCoordinateLabel.displayName = "PlacementCoordinateLabel";
