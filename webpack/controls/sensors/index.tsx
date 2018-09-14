import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { SensorList } from "./sensor_list";
import { SensorForm } from "./sensor_form";
import { Widget, WidgetBody, WidgetHeader, SaveBtn } from "../../ui/index";
import { SensorsProps } from "../../devices/interfaces";
import { SensorState } from "./interfaces";
import {
  TaggedSensor,
  SpecialStatus
} from "farmbot";
import {
  getArrayStatus,
} from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolTips } from "../../constants";
import { uniq } from "lodash";

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

  taggedSensor = (pin: number, label: string, mode: 0 | 1): TaggedSensor => {
    return {
      uuid: "WILL_BE_CHANGED_BY_REDUCER",
      specialStatus: SpecialStatus.SAVED,
      kind: "Sensor",
      body: { pin, label, mode }
    };
  }

  emptySensor = (): TaggedSensor => {
    return this.taggedSensor(0, t("New Sensor"), 0);
  }

  stockSensors = (dispatch: Function) => {
    const newSensor = (pin: number, label: string, mode: 0 | 1) => {
      dispatch(init(this.taggedSensor(pin, label, mode)));
    };

    newSensor(63, t("Tool Verification"), 0);
    newSensor(59, t("Soil Moisture"), 1);
  }

  render() {
    const { dispatch, sensors } = this.props;
    const { isEditing } = this.state;

    const status = getArrayStatus(sensors);

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
          onClick={() => { dispatch(init(this.emptySensor())); }}>
          <i className="fa fa-plus" />
        </button>
        <button
          hidden={!isEditing}
          className="fb-button green"
          type="button"
          onClick={() => this.stockSensors(dispatch)}>
          <i className="fa fa-plus" />
          {t("Stock sensors")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        {this.showPins()}
      </WidgetBody>
    </Widget>;
  }
}
