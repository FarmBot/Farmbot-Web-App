import * as React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { ToolSlotPoint } from "./tool_slot_point";
import { MapTransformProps } from "../../interfaces";
import { maybeNoPointer } from "../../util";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
}

export function ToolSlotLayer(props: ToolSlotLayerProps) {
  const { slots, visible, mapTransformProps } = props;

  return <g
    id="toolslot-layer"
    style={maybeNoPointer({ cursor: "pointer" })}>
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
