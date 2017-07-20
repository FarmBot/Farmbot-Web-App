import * as React from "react";
import { ToggleButton } from "../toggle_button";
import { pinToggle } from "../../devices/actions";
import { Row, Col } from "../../ui";
import { PeripheralListProps } from "./interfaces";
import { sortResourcesById } from "../../util";

export function PeripheralList(props: PeripheralListProps) {
  let { pins } = props;
  return <div>
    {sortResourcesById(props.peripherals).map(p => {
      let value = (pins[p.body.pin || -1] || { value: undefined }).value;
      return <Row key={p.uuid}>
        <Col xs={4}>
          <label>{p.body.label}</label>
        </Col>
        <Col xs={4}>
          <p>{p.body.pin}</p>
        </Col>
        <Col xs={4}>
          <ToggleButton
            toggleValue={value}
            toggleAction={() => p.body.pin && pinToggle(p.body.pin)} />
        </Col>
      </Row>
    })}
  </div>
};
