import * as React from "react";
import { t } from "i18next";
import { destroy, edit } from "../../api/crud";
import { PeripheralFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { KeyValEditRow } from "../key_val_edit_row";

export function PeripheralForm(props: PeripheralFormProps) {
  const { dispatch, peripherals } = props;

  return <div>
    {sortResourcesById(peripherals).map(p => {

      return <KeyValEditRow
        key={p.uuid}
        label={p.body.label}
        onLabelChange={(e) => {
          const { value } = e.currentTarget;
          dispatch(edit(p, { label: value }));
        }}
        labelPlaceholder="Name"
        value={(p.body.pin || "").toString()}
        valuePlaceholder={t("Pin #")}
        onValueChange={(e) => {
          const { value } = e.currentTarget;
          const update: Partial<typeof p.body> = { pin: parseInt(value, 10) };
          dispatch(edit(p, update));
        }}
        onClick={() => { dispatch(destroy(p.uuid)); }}
        disabled={false}
        valueType="number" />;
    })}
  </div>;
}
