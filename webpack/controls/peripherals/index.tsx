import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { PeripheralList } from "./peripheral_list";
import { PeripheralForm } from "./peripheral_form";
import { Widget, WidgetBody, WidgetHeader, SaveBtn } from "../../ui";
import { PeripheralsProps } from "../../devices/interfaces";
import { PeripheralState } from "./interfaces";
import { TaggedPeripheral, getArrayStatus } from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolTips } from "../../constants";
import * as _ from "lodash";

export class Peripherals extends React.Component<PeripheralsProps, PeripheralState> {
  constructor() {
    super();
    this.state = { isEditing: false };
  }

  toggle = () => {
    this.setState({ isEditing: !this.state.isEditing });
  }

  maybeSave = () => {
    const { peripherals } = this.props;
    const pinNums = peripherals.map(x => x.body.pin);
    const positivePins = pinNums.filter(x => x && x > 0);
    const smallPins = pinNums.filter(x => x && x < 1000);
    // I hate adding client side validation, but this is a wonky endpoint - RC.
    const allAreUniq = _.uniq(pinNums).length === pinNums.length;
    const allArePositive = positivePins.length === pinNums.length;
    const allAreSmall = smallPins.length === pinNums.length;
    if (allAreUniq && allArePositive) {
      if (allAreSmall) {
        this.props.dispatch(saveAll(this.props.peripherals, this.toggle));
      } else {
        error(t("Pin numbers must be less than 1000."));
      }
    } else {
      error(t("Pin numbers are required and must be positive and unique."));
    }
  }

  showPins = () => {
    const { peripherals, dispatch, bot, disabled } = this.props;

    const pins = bot.hardware.pins;
    if (this.state.isEditing) {
      return <PeripheralForm peripherals={peripherals}
        dispatch={dispatch} />;
    } else {
      return <PeripheralList peripherals={peripherals}
        dispatch={dispatch}
        pins={pins}
        disabled={disabled} />;
    }
  }

  emptyPeripheral = (): TaggedPeripheral => {
    return {
      uuid: "WILL_BE_CHANGED_BY_REDUCER",
      specialStatus: undefined,
      kind: "Peripheral",
      body: { pin: 0, label: "New Peripheral" }
    };
  }

  render() {
    const { dispatch, peripherals } = this.props;
    const { isEditing } = this.state;

    const status = getArrayStatus(peripherals);

    return <Widget className="peripherals-widget">
      <WidgetHeader title={"Peripheral"} helpText={ToolTips.PERIPHERALS}>
        <button
          className="fb-button gray"
          onClick={this.toggle}
          hidden={!!status}>
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
          onClick={() => { dispatch(init(this.emptyPeripheral())); }}>
          <i className="fa fa-plus" />
        </button>
      </WidgetHeader>
      <WidgetBody>
        {this.showPins()}
      </WidgetBody>
    </Widget>;
  }
}
