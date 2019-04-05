import * as React from "react";

import { destroy, edit } from "../../api/crud";
import { SensorFormProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, Col, FBSelect } from "../../ui";
import {
  pinDropdowns
} from "../../sequences/step_tiles/pin_and_peripheral_support";
import { PIN_MODES } from "../../sequences/step_tiles/tile_pin_support";
import { t } from "../../i18next_wrapper";

export function SensorForm(props: SensorFormProps) {
  const { dispatch, sensors } = props;
  const modes: { [s: string]: string } = {
    0: t("Digital"),
    1: t("Analog")
  };
  return <div>
    {sortResourcesById(sensors).map(p => {
      return <Row key={p.uuid + p.body.id}>
        <Col xs={4}>
          <input type="text"
            placeholder={t("Name")}
            value={p.body.label}
            onChange={e => dispatch(edit(p, {
              label: e.currentTarget.value
            }))} />
        </Col>
        <Col xs={3}>
          <FBSelect
            selectedItem={
              { label: t("Pin ") + `${p.body.pin}`, value: p.body.pin || "" }}
            onChange={d => dispatch(edit(p, {
              pin: parseInt(d.value.toString(), 10)
            }))}
            list={pinDropdowns(n => n)} />
        </Col>
        <Col xs={3}>
          <FBSelect
            onChange={d => {
              dispatch(edit(p, { mode: parseInt(d.value.toString(), 10) }));
            }}
            selectedItem={{ label: modes[p.body.mode], value: p.body.mode }}
            list={PIN_MODES} />
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
