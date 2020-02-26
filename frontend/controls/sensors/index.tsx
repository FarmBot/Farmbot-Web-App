import * as React from "react";
import { error } from "../../toast/toast";
import { SensorList } from "./sensor_list";
import { SensorForm } from "./sensor_form";
import { Widget, WidgetBody, WidgetHeader, SaveBtn } from "../../ui/index";
import { SensorsProps } from "../../devices/interfaces";
import { SensorState } from "./interfaces";
import { getArrayStatus } from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolTips } from "../../constants";
import { uniq } from "lodash";
import { t } from "../../i18next_wrapper";

export class Sensors extends React.Component<SensorsProps, SensorState> {
  constructor(props: SensorsProps) {
    super(props);
    this.state = { isEditing: false };
  }

  toggle = () => {
    this.setState({ isEditing: !this.state.isEditing });
  }

  maybeSave = () => {
    const pinNums = this.props.sensors.map(x => x.body.pin);
    const allAreUniq = uniq(pinNums).length === pinNums.length;
    if (allAreUniq) {
      this.props.dispatch(saveAll(this.props.sensors, this.toggle));
    } else {
      error(t("Pin numbers must be unique."));
    }
  }

  showPins = () => {
    const { sensors, dispatch, bot, disabled } = this.props;

    const pins = bot.hardware.pins;
    if (this.state.isEditing) {
      return <SensorForm sensors={sensors}
        dispatch={dispatch} />;
    } else {
      return <SensorList sensors={sensors}
        dispatch={dispatch}
        pins={pins}
        disabled={disabled} />;
    }
  }

  newSensor = (pin = 0, label = t("New Sensor"), mode: 0 | 1 = 0) => {
    this.props.dispatch(init("Sensor", { pin, label, mode: mode || 0 }));
  };

  stockSensors = () => {
    this.newSensor(63, t("Tool Verification"), 0);
    this.newSensor(59, t("Soil Moisture"), 1);
  }

  render() {
    const { isEditing } = this.state;
    const status = getArrayStatus(this.props.sensors);

    return <Widget className="sensors-widget">
      <WidgetHeader title={t("Sensors")} helpText={ToolTips.SENSORS}>
        <button
          className="fb-button gray"
          onClick={this.toggle}
          disabled={!!status && isEditing}>
          {!isEditing && t("Edit")}
          {isEditing && t("Back")}
        </button>
        <SaveBtn
          hidden={!isEditing}
          status={status}
          onClick={this.maybeSave} />
        <button
          hidden={!isEditing}
          className="fb-button green"
          type="button"
          onClick={() => this.newSensor()}>
          <i className="fa fa-plus" />
        </button>
        <button
          hidden={!isEditing || this.props.firmwareHardware == "none"}
          className="fb-button green"
          type="button"
          onClick={this.stockSensors}>
          <i className="fa fa-plus" style={{ marginRight: "0.5rem" }} />
          {t("Stock sensors")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        {this.showPins()}
      </WidgetBody>
    </Widget>;
  }
}
