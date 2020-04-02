import * as React from "react";
import { TaggedGenericPointer } from "farmbot";
import { GardenPoint } from "./garden_point";
import { MapTransformProps } from "../../interfaces";

export interface PointLayerProps {
  visible: boolean;
  genericPoints: TaggedGenericPointer[];
  mapTransformProps: MapTransformProps;
  hoveredPoint: string | undefined;
  dispatch: Function;
  interactions: boolean;
}

export function PointLayer(props: PointLayerProps) {
  const { visible, genericPoints, mapTransformProps, hoveredPoint } = props;
  const style: React.CSSProperties =
    props.interactions ? {} : { pointerEvents: "none" };
  return <g id={"point-layer"} style={style}>
    {visible &&
      genericPoints.map(p =>
        <GardenPoint
          point={p}
          key={p.uuid}
          hovered={hoveredPoint == p.uuid}
          dispatch={props.dispatch}
          mapTransformProps={mapTransformProps} />)}
  </g>;
}
