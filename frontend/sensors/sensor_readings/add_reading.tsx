import { TaggedSensor, Xyz } from "farmbot";
import { isNumber } from "lodash";
import moment from "moment";
import React from "react";
import { initSave } from "../../api/crud";
import { AxisInputBox } from "../../controls/axis_input_box";
import { offsetTime } from "../../farm_events/edit_fe_form";
import { formatDateField } from "../../farm_events/map_state_to_props_add_edit";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { error } from "../../toast/toast";
import { BlurableInput, Row } from "../../ui";
import { SensorSelection } from "./sensor_selection";

export interface AddSensorReadingMenuProps {
  closeMenu(): void;
  sensors: TaggedSensor[];
  dispatch: Function;
  timeSettings: TimeSettings;
}

interface AddSensorReadingMenuState {
  x: number;
  y: number;
  z: number;
  sensor: TaggedSensor | undefined;
  pin: number | undefined;
  value: number | undefined;
  date: string;
  time: string;
}

export class AddSensorReadingMenu
  extends React.Component<AddSensorReadingMenuProps, AddSensorReadingMenuState> {
  state: AddSensorReadingMenuState = {
    x: 0,
    y: 0,
    z: 0,
    sensor: undefined,
    pin: undefined,
    value: undefined,
    date: formatDateField(moment().toString(), this.props.timeSettings),
    time: moment(new Date().toISOString()).format("HH:mm"),
  };

  render() {
    return <div className={"add-sensor-reading-menu grid"}>
      <div className="row grid-2-col">
        <SensorSelection
          selectedSensor={this.state.sensor}
          sensors={this.props.sensors}
          setSensor={sensor => this.setState({ sensor })} />
        <div className={"add-reading-value-form grid no-gap"}>
          <label>{t("value")}</label>
          <BlurableInput
            type={"number"}
            className={"add-reading-value"}
            value={this.state.value || 0}
            onCommit={e => this.setState({
              value: parseInt(e.currentTarget.value)
            })} />
        </div>
      </div>
      <div className="row grid-2-col">
        <div className={"add-reading-value-form grid no-gap"}>
          <label>
            {t("Date")}
          </label>
          <BlurableInput
            type={"date"}
            className={"reading-date"}
            name={"date"}
            value={this.state.date}
            onCommit={e => this.setState({ date: e.currentTarget.value })} />
        </div>
        <div className={"add-reading-value-form grid no-gap"}>
          <label>
            {t("Time")}
          </label>
          <BlurableInput
            type={"time"}
            className={"reading-time"}
            name={"time"}
            value={this.state.time}
            onCommit={e => this.setState({ time: e.currentTarget.value })} />
        </div>
      </div>
      <div className={"reading-location"}>
        <Row>
          {["x", "y", "z"].map(axis =>
            <div key={axis + "_heading"}>
              <label>{axis}</label>
            </div>)}
        </Row>
        <Row>
          {["x", "y", "z"].map((axis: Xyz) =>
            <AxisInputBox
              key={axis}
              axis={axis}
              value={this.state[axis]}
              onChange={(a: Xyz, v) =>
                this.setState({ ...this.state, [a]: v })} />)}
        </Row>
      </div>
      <button className={"fb-button green"}
        onClick={() => {
          if (!this.state.sensor || !this.state.sensor.body.pin) {
            error(t("Please select a sensor with a valid pin number."));
            return;
          }
          if (!isNumber(this.state.value)) {
            error(t("Please enter a value."));
            return;
          }
          const max = this.state.sensor.body.mode ? 1023 : 1;
          if (this.state.value < 0 || this.state.value > max) {
            error(t("Please enter a value between 0 and {{ max }}", { max }));
            return;
          }
          this.props.dispatch(initSave("SensorReading", {
            pin: this.state.sensor.body.pin,
            mode: this.state.sensor.body.mode,
            value: this.state.value,
            x: this.state.x,
            y: this.state.y,
            z: this.state.z,
            read_at: offsetTime(this.state.date, this.state.time,
              this.props.timeSettings),
          }));
          this.props.closeMenu();
        }}>
        {t("save")}
      </button>
    </div>;
  }
}
