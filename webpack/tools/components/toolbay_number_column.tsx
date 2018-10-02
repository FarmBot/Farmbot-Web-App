import * as React from "react";
import { TaggedToolSlotPointer } from "farmbot";
import { Col, BlurableInput } from "../../ui";
import { edit } from "../../api/crud";

export interface TBNumColProps {
  axis: "x" | "y" | "z";
  value: number;
  dispatch: Function;
  slot: TaggedToolSlotPointer;
}

/** Used to display and edit the X/Y/Z numeric values in the tool bay form. */
export function ToolBayNumberCol(props: TBNumColProps) {
  const { axis, value, dispatch, slot } = props;
  return <Col xs={2}>
    <BlurableInput
      value={value.toString()}
      onCommit={e =>
        dispatch(edit(slot, { [axis]: parseFloat(e.currentTarget.value) }))}
      type="number" />
  </Col>;
}
