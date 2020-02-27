import * as React from "react";
import { error } from "../../toast/toast";
import { PeripheralList } from "./peripheral_list";
import { PeripheralForm } from "./peripheral_form";
import { Widget, WidgetBody, WidgetHeader, SaveBtn } from "../../ui/index";
import { PeripheralsProps } from "../../devices/interfaces";
import { PeripheralState } from "./interfaces";
import { getArrayStatus } from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolTips } from "../../constants";
import { uniq, isNumber } from "lodash";
import { t } from "../../i18next_wrapper";

export class Peripherals
  extends React.Component<PeripheralsProps, PeripheralState> {
  constructor(props: PeripheralsProps) {
    super(props);
    this.state = { isEditing: false };
  }

  toggle = () => this.setState({ isEditing: !this.state.isEditing });

  maybeSave = () => {
    const { peripherals } = this.props;
    const pins = peripherals.map(x => x.body.pin);
    const allAreUniq = uniq(pins).length === pins.length;
    const allArePins = pins.filter(x => isNumber(x)).length === pins.length;
    if (!allArePins) {
      return error(t("Please select a pin."));
    }
    if (!allAreUniq) {
      return error(t("Pin numbers must be unique."));
    }
    this.props.dispatch(saveAll(this.props.peripherals, this.toggle));
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

  newPeripheral = (
    pin: number | undefined = undefined,
    label = t("New Peripheral")
  ) => {
    this.props.dispatch(init("Peripheral", { pin, label }));
  };

  get stockPeripherals() {
    switch (this.props.firmwareHardware) {
      case "arduino":
        return [
          { pin: 8, label: t("Water") },
          { pin: 9, label: t("Vacuum") },
        ];
      case "farmduino":
      case "farmduino_k14":
      case "farmduino_k15":
      default:
        return [
          { pin: 7, label: t("Lighting") },
          { pin: 8, label: t("Water") },
          { pin: 9, label: t("Vacuum") },
          { pin: 10, label: t("Peripheral ") + "4" },
          { pin: 12, label: t("Peripheral ") + "5" },
        ];
      case "express_k10":
        return [
          { pin: 7, label: t("Lighting") },
          { pin: 8, label: t("Water") },
          { pin: 9, label: t("Vacuum") },
        ];
    }
  }

  render() {
    const { isEditing } = this.state;
    const status = getArrayStatus(this.props.peripherals);

    return <Widget className="peripherals-widget">
      <WidgetHeader title={t("Peripherals")} helpText={ToolTips.PERIPHERALS}>
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
          onClick={() => this.newPeripheral()}>
          <i className="fa fa-plus" />
        </button>
        <button
          hidden={!isEditing || this.props.firmwareHardware == "none"}
          className="fb-button green"
          type="button"
          onClick={() => this.stockPeripherals.map(p =>
            this.newPeripheral(p.pin, p.label))}>
          <i className="fa fa-plus" style={{ marginRight: "0.5rem" }} />
          {t("Stock")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        {this.showPins()}
      </WidgetBody>
    </Widget>;
  }
}
