import React from "react";
import { error } from "../toast/toast";
import { SensorList } from "./sensor_list";
import { SensorForm } from "./sensor_form";
import {
  SaveBtn, EmptyStateWrapper, EmptyStateGraphic,
} from "../ui";
import { SensorsProps, SensorState } from "./interfaces";
import { getArrayStatus } from "../resources/tagged_resources";
import { saveAll, init } from "../api/crud";
import { Content } from "../constants";
import { uniq } from "lodash";
import { t } from "../i18next_wrapper";
import { SensorType } from "farmbot/dist/resources/api_resources";
import { hasCurrentSensors } from
  "../settings/firmware/firmware_hardware_support";

export class Sensors extends React.Component<SensorsProps, SensorState> {
  constructor(props: SensorsProps) {
    super(props);
    this.state = { isEditing: false };
  }

  toggle = () => {
    this.setState({ isEditing: !this.state.isEditing });
  };

  maybeSave = () => {
    const pinNums = this.props.sensors.map(x => x.body.pin);
    const allAreUniq = uniq(pinNums).length === pinNums.length;
    if (allAreUniq) {
      this.props.dispatch(saveAll(this.props.sensors, this.toggle));
    } else {
      error(t("Pin numbers must be unique."));
    }
  };

  showPins = () => {
    const { sensors, peripherals, dispatch, bot, disabled } = this.props;

    const pins = bot.hardware.pins;
    if (this.state.isEditing) {
      return <SensorForm sensors={sensors}
        dispatch={dispatch} />;
    } else {
      return <SensorList sensors={sensors}
        peripherals={peripherals}
        dispatch={dispatch}
        pins={pins}
        disabled={disabled}
        locked={bot.hardware.informational_settings.locked} />;
    }
  };

  newSensor = (
    pin = 0,
    label = t("New Sensor"),
    mode: 0 | 1 = 0,
    type: SensorType = "none",
  ) => {
    if (!this.props.sensors.map(sensor => sensor.body.pin).includes(pin)) {
      this.props.dispatch(init("Sensor", {
        pin,
        label,
        mode,
        type,
      }));
    }
  };

  stockSensors = () => {
    this.newSensor(63, t("Tool Verification"), 0, "tool_verification");
    this.newSensor(59, t("Soil Moisture"), 1, "soil_moisture");
    if (hasCurrentSensors(this.props.firmwareHardware)) {
      this.newSensor(54, t("Lighting Load Sense"), 1, "current");
      this.newSensor(55, t("Water Load Sense"), 1, "current");
      this.newSensor(56, t("Peripheral 5 Load Sense"), 1, "current");
      this.newSensor(57, t("Peripheral 4 Load Sense"), 1, "current");
      this.newSensor(58, t("Vacuum Load Sense"), 1, "current");
      this.newSensor(60, t("Rotary Tool Load Sense"), 1, "current");
    }
  };

  render() {
    const { isEditing } = this.state;
    const status = getArrayStatus(this.props.sensors);
    const editButtonText = isEditing
      ? t("Back")
      : t("Edit");
    return <div className="sensors-panel">
      <div className="panel-header">
        <h2 className="panel-title">{t("Sensors")}</h2>
        <div>
          <button
            className="fb-button gray"
            onClick={this.toggle}
            title={editButtonText}
            disabled={!!status && isEditing}>
            {editButtonText}
          </button>
          <SaveBtn
            hidden={!isEditing}
            status={status}
            onClick={this.maybeSave} />
          <button
            hidden={!isEditing}
            className="fb-button green"
            type="button"
            title={t("add sensors")}
            onClick={() => this.newSensor()}>
            <i className="fa fa-plus" />
          </button>
          <button
            hidden={!isEditing || this.props.firmwareHardware == "none"}
            className="fb-button green"
            type="button"
            title={t("add stock sensors")}
            onClick={this.stockSensors}>
            <i className="fa fa-plus" style={{ marginRight: "0.5rem" }} />
            {t("Stock sensors")}
          </button>
        </div>
      </div>
      <EmptyStateWrapper
        notEmpty={this.props.sensors.length > 0 || isEditing}
        graphic={EmptyStateGraphic.tools}
        title={t("No Sensors yet.")}
        text={Content.NO_SENSORS}
        colorScheme={"sensors"}>
        {this.showPins()}
      </EmptyStateWrapper>
    </div>;
  }
}
