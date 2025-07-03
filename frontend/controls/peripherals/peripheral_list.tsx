import React from "react";
import { pinToggle, writePin } from "../../devices/actions";
import { PeripheralListProps } from "./interfaces";
import { sortResourcesById } from "../../util";
import { Row, ToggleButton } from "../../ui";
import { t } from "../../i18next_wrapper";
import { Slider } from "@blueprintjs/core";
import { ANALOG } from "farmbot";
import { lockedClass } from "../locked_class";
import { isUndefined } from "lodash";
import { forceOnline } from "../../devices/must_be_online";

export const PeripheralList = (props: PeripheralListProps) =>
  <div className="peripheral-list grid">
    {sortResourcesById(props.peripherals).map(peripheral => {
      const actualToggleValue =
        (props.pins[peripheral.body.pin || -1] || { value: undefined }).value;
      const toggleValue = (isUndefined(actualToggleValue) && forceOnline())
        ? 0
        : actualToggleValue;
      return <Row key={peripheral.uuid} className="grid-exp-1">
        <label>{peripheral.body.label}</label>
        <p>{"" + peripheral.body.pin}</p>
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
