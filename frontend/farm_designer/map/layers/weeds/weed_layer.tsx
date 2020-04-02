import * as React from "react";
import { TaggedWeedPointer } from "farmbot";
import { GardenWeed } from "./garden_weed";
import { MapTransformProps } from "../../interfaces";
import { UUID } from "../../../../resources/interfaces";

export interface WeedLayerProps {
  visible: boolean;
  spreadVisible: boolean;
  weeds: TaggedWeedPointer[];
  mapTransformProps: MapTransformProps;
  hoveredPoint: UUID | undefined;
  currentPoint: UUID | undefined;
  boxSelected: UUID[] | undefined;
  groupSelected: UUID[];
  dispatch: Function;
  animate: boolean;
  interactions: boolean;
}

export function WeedLayer(props: WeedLayerProps) {
  const { visible, weeds, mapTransformProps } = props;
  return <g id={"weeds-layer"} style={props.interactions
    ? { cursor: "pointer" } : { pointerEvents: "none" }}>
    {visible &&
      weeds.map(p => {
        const current = p.uuid === props.currentPoint;
        const hovered = p.uuid === props.hoveredPoint;
        const selectedByBox = !!props.boxSelected?.includes(p.uuid);
        const selectedByGroup = props.groupSelected.includes(p.uuid);
        return <GardenWeed
          weed={p}
          key={p.uuid}
          hovered={hovered}
          current={current}
          selected={selectedByBox || selectedByGroup}
          animate={props.animate}
          spreadVisible={props.spreadVisible}
          dispatch={props.dispatch}
          mapTransformProps={mapTransformProps} />;
      })}
  </g>;
}
