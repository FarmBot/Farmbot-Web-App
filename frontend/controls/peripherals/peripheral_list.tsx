import * as React from "react";
import { pinToggle } from "../../devices/actions";
import { PeripheralListProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { KeyValShowRow } from "../key_val_show_row";
import { t } from "i18next";

export function PeripheralList(props: PeripheralListProps) {
  const { pins, disabled } = props;
  return <div>
    {sortResourcesById(props.peripherals).map(p => {
      return <KeyValShowRow key={p.uuid}
        label={p.body.label}
        labelPlaceholder=""
        value={"" + p.body.pin}
        toggleValue={(pins[p.body.pin || -1] || { value: undefined }).value}
        valuePlaceholder=""
        title={t(`Toggle ${p.body.label}`)}
        onClick={() => p.body.pin && pinToggle(p.body.pin)}
        disabled={!!disabled} />;
    })}
  </div>;
}
