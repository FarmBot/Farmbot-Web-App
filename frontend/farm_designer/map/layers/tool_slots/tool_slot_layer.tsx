import * as React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { ToolSlotPoint } from "./tool_slot_point";
import { MapTransformProps } from "../../interfaces";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
  interactions: boolean;
}

export function ToolSlotLayer(props: ToolSlotLayerProps) {
  const { slots, visible, mapTransformProps } = props;

  return <g
    id="toolslot-layer"
    style={props.interactions
      ? { cursor: "pointer" }
      : { pointerEvents: "none" }}>
    {visible &&
      slots.map(slot =>
        <ToolSlotPoint
          key={slot.toolSlot.uuid}
          slot={slot}
          hoveredToolSlot={props.hoveredToolSlot}
          dispatch={props.dispatch}
          botPositionX={props.botPositionX}
          mapTransformProps={mapTransformProps} />)}
  </g>;
}
