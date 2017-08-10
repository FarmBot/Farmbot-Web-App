import * as React from "react";
import { TaggedGenericPointer } from "../../../resources/tagged_resources";
import { GardenPoint } from "../garden_point";
import { BotOriginQuadrant } from "../../interfaces";

interface PointLayerProps {
  visible: boolean;
  points: TaggedGenericPointer[];
  botOriginQuadrant: BotOriginQuadrant;
}

export function PointLayer(props: PointLayerProps) {
  let { visible, points, botOriginQuadrant } = props;
  return visible ? <g>
    {points.map(p =>
      <GardenPoint
        point={p}
        key={p.body.id}
        quadrant={botOriginQuadrant}
      />
    )}}
  </g> : <g />; // fallback
}
