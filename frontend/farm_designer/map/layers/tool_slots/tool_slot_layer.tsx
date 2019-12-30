import * as React from "react";
import { SlotWithTool, UUID } from "../../../../resources/interfaces";
import { ToolSlotPoint } from "./tool_slot_point";
import { MapTransformProps } from "../../interfaces";
import { history, getPathArray } from "../../../../history";
import { maybeNoPointer } from "../../util";
import { DevSettings } from "../../../../account/dev/dev_support";

export interface ToolSlotLayerProps {
  visible: boolean;
  slots: SlotWithTool[];
  botPositionX: number | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
  hoveredToolSlot: UUID | undefined;
}

export function ToolSlotLayer(props: ToolSlotLayerProps) {
  const pathArray = getPathArray();
  const canClickTool = !(pathArray[3] === "plants" && pathArray.length > 4);
  const goToToolsPage = () => canClickTool &&
    !DevSettings.futureFeaturesEnabled() && history.push("/app/tools");
  const { slots, visible, mapTransformProps } = props;
  const cursor = canClickTool ? "pointer" : "default";

  return <g
    id="toolslot-layer"
    onClick={goToToolsPage}
    style={maybeNoPointer({ cursor: cursor })}>
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
