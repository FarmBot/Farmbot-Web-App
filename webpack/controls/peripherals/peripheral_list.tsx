import * as React from "react";
import { pinToggle } from "../../devices/actions";
import { PeripheralListProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { KeyValShowRow } from "../key_val_show_row";

export function PeripheralList(props: PeripheralListProps) {
  const { pins, disabled } = props;
  return <div>
    {sortResourcesById(props.peripherals).map(p => {
      const value = "" + (pins[p.body.pin || -1] || "");
      return <KeyValShowRow key={p.uuid}
        label={p.body.label}
        value={value || ""}
        onClick={() => p.body.pin && pinToggle(p.body.pin)}
        disabled={!!disabled} />;
    })}
  </div>;
}
