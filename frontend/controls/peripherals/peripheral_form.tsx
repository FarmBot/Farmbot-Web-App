import * as React from "react";
import { destroy, edit } from "../../api/crud";
import { PeripheralFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { t } from "../../i18next_wrapper";
import { Row, Col, FBSelect } from "../../ui";
import {
  pinDropdowns
} from "../../sequences/step_tiles/pin_and_peripheral_support";

export function PeripheralForm(props: PeripheralFormProps) {
  const { dispatch, peripherals } = props;

  return <div>
    {sortResourcesById(peripherals).map(p => {
      return <Row key={p.uuid + p.body.id}>
        <Col xs={6}>
          <input type="text"
            placeholder={t("Name")}
            value={p.body.label}
            onChange={e =>
              dispatch(edit(p, { label: e.currentTarget.value }))} />
        </Col>
        <Col xs={4}>
          <FBSelect
            selectedItem={{
              label: t("Pin ") + `${p.body.pin}`,
              value: p.body.pin || ""
            }}
            onChange={d =>
              dispatch(edit(p, { pin: parseInt(d.value.toString(), 10) }))}
            list={pinDropdowns(n => n)} />
        </Col>
        <Col xs={2}>
          <button
            className="red fb-button"
            onClick={() => dispatch(destroy(p.uuid))}>
            <i className="fa fa-minus" />
          </button>
        </Col>
      </Row>;
    })}
  </div>;
}
