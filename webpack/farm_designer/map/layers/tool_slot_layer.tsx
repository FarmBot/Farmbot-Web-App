import * as React from "react";
import { SlotWithTool } from "../../../resources/interfaces";
import { ToolSlotPoint } from "../tool_slot_point";
import { MapTransformProps } from "../interfaces";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  mapTransformProps: MapTransformProps;
}

export function ToolSlotLayer(props: ToolSlotLayerProps) {
  const { slots, visible, mapTransformProps } = props;
  return visible ? <g>
    {slots.map(slot =>
      <ToolSlotPoint
        key={slot.toolSlot.uuid}
        slot={slot}
        mapTransformProps={mapTransformProps} />
    )}
  </g> : <g />; // fallback
}
