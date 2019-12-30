import * as React from "react";
import { pinToggle } from "../../devices/actions";
import { PeripheralListProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, Col } from "../../ui";
import { ToggleButton } from "../toggle_button";
import { t } from "../../i18next_wrapper";

export const PeripheralList = (props: PeripheralListProps) =>
  <div className="peripheral-list">
    {sortResourcesById(props.peripherals).map(peripheral => {
      const toggleValue =
        (props.pins[peripheral.body.pin || -1] || { value: undefined }).value;
      return <Row key={peripheral.uuid}>
        <Col xs={6}>
          <label>{peripheral.body.label}</label>
        </Col>
        <Col xs={4}>
          <p>{"" + peripheral.body.pin}</p>
        </Col>
        <Col xs={2}>
          <ToggleButton
            toggleValue={toggleValue}
            toggleAction={() =>
              peripheral.body.pin && pinToggle(peripheral.body.pin)}
            title={t(`Toggle ${peripheral.body.label}`)}
            customText={{ textFalse: t("off"), textTrue: t("on") }}
            disabled={!!props.disabled} />
        </Col>
      </Row>;
    })}
  </div>;
