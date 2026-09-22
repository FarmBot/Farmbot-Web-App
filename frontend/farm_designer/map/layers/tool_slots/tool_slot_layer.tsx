import React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { ToolSlotPoint } from "./tool_slot_point";
import { MapTransformProps } from "../../interfaces";
import { BotPosition } from "../../../../devices/interfaces";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  botPosition: BotPosition;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
  interactions: boolean;
  currentPoint: UUID | undefined;
  animate: boolean;
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
          current={slot.toolSlot.uuid === props.currentPoint}
          animate={props.animate}
          dispatch={props.dispatch}
          botPosition={props.botPosition}
          mapTransformProps={mapTransformProps} />)}
  </g>;
}
