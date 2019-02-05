import * as React from "react";
import { TaggedGenericPointer } from "farmbot";
import { GardenPoint } from "./garden_point";
import { MapTransformProps } from "../../interfaces";

export interface PointLayerProps {
  visible: boolean;
  points: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
}

export function PointLayer(props: PointLayerProps) {
  const { visible, points, mapTransformProps } = props;
  return <g id="point-layer">
    {visible &&
      points.map(p =>
        <GardenPoint
          point={p}
          key={p.uuid}
          mapTransformProps={mapTransformProps} />
      )}
  </g>;
}
