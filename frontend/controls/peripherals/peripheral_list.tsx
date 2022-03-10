import React from "react";
import { pinToggle, writePin } from "../../devices/actions";
import { PeripheralListProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, Col, ToggleButton } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Slider } from "@blueprintjs/core";
import { ANALOG } from "farmbot";
import { lockedClass } from "../locked_class";
import { round } from "lodash";
import { PinMode } from "../../sequences/step_tiles/pin_support/mode";

export const PeripheralList = (props: PeripheralListProps) =>
  <div className="peripheral-list">
    {sortResourcesById(props.peripherals).map(peripheral => {
      const toggleValue =
        (props.pins[peripheral.body.pin || -1] || { value: undefined }).value;
      return <Row key={peripheral.uuid}>
        <Col xs={6}>
          <label>{peripheral.body.label}</label>
        </Col>
        <Col xs={2}>
          <p>{"" + peripheral.body.pin}</p>
        </Col>
        <Col xs={4}>
          {peripheral.body.mode == 1
            ? <AnalogSlider
              initialValue={toggleValue}
              pin={peripheral.body.pin}
              disabled={props.disabled || props.locked} />
            : <ToggleButton
              toggleValue={toggleValue}
              toggleAction={() => {
                peripheral.body.pin && pinToggle(peripheral.body.pin);
              }}
              title={t(`Toggle ${peripheral.body.label}`)}
              customText={{ textFalse: t("off"), textTrue: t("on") }}
              className={lockedClass(props.locked)}
              disabled={!!props.disabled} />}
        </Col>
      </Row>;
    })}
  </div>;

export interface AnalogSliderProps {
  disabled: boolean | undefined;
  pin: number | undefined;
  initialValue: number | undefined;
}

interface AnalogSliderState {
  value: number;
  controlled: boolean;
}

export class AnalogSlider
  extends React.Component<AnalogSliderProps, AnalogSliderState> {
  state: AnalogSliderState = { value: 0, controlled: false };
  render() {
    const { pin } = this.props;
    return <div className={"slider-container"}>
      <Slider
        disabled={!!this.props.disabled}
        min={0}
        max={255}
        labelStepSize={255}
        value={this.state.controlled ? this.state.value : this.props.initialValue}
        onChange={value => this.setState({ value, controlled: true })}
        onRelease={value => { pin && writePin(pin, value, ANALOG); }} />
    </div>;
  }
}

export enum PinIOMode {
  "input" = 0,
  "output" = 1,
  "input_pullup" = 2,
}

/* Calculate 0-255 pin value based on pin i/o mode. */
export const calc8BitValue = (
  pinIOMode: PinIOMode,
  value: number | undefined,
  mode: PinMode,
) => {
  switch (pinIOMode) {
    case PinIOMode.input:
      return mode == PinMode.digital
        ? (value || 0) * 255
        : round((value || 0) / 1024 * 255);
    case PinIOMode.output:
      return mode == PinMode.digital
        ? (value || 0) * 255
        : value;
    case PinIOMode.input_pullup:
      return mode == PinMode.digital
        ? (1 - (value || 1)) * 255
        : round((1024 - (value || 1024)) / 1024 * 255);
  }
};
