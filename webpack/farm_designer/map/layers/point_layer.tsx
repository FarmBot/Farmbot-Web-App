import * as React from "react";
import { TaggedGenericPointer } from "../../../resources/tagged_resources";
import { GardenPoint } from "../garden_point";
import { MapTransformProps } from "../interfaces";

interface PointLayerProps {
  visible: boolean;
  points: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
}

export function PointLayer(props: PointLayerProps) {
  const { visible, points, mapTransformProps } = props;
  return visible ? <g>
    {points.map(p =>
      <GardenPoint
        point={p}
        key={p.body.id}
        mapTransformProps={mapTransformProps} />
    )}
  </g> : <g />; // fallback
}
