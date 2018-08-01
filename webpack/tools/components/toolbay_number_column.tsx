import * as React from "react";
import { TaggedToolSlotPointer } from "farmbot";
import { Col, BlurableInput } from "../../ui/index";
import { edit } from "../../api/crud";

interface NumColProps {
  axis: "x" | "y" | "z";
  value: number;
  dispatch: Function;
  slot: TaggedToolSlotPointer;
}

/** Used to display and edit the X/Y/Z numeric values in the tool bay form. */
export function ToolBayNumberCol({ axis, value, dispatch, slot }: NumColProps) {
  return <Col xs={2}>
    <BlurableInput
      value={value.toString()}
      onCommit={(e) => {
        dispatch(edit(slot, { [axis]: parseInt(e.currentTarget.value, 10) }));
      }}
      type="number" />
  </Col>;
}
