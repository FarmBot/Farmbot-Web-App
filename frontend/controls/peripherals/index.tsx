import React from "react";
import { error } from "../../toast/toast";
import { PeripheralList } from "./peripheral_list";
import { PeripheralForm } from "./peripheral_form";
import { SaveBtn, EmptyStateWrapper, EmptyStateGraphic } from "../../ui";
import { PeripheralsProps, PeripheralState } from "./interfaces";
import { getArrayStatus } from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { Content } from "../../constants";
import { uniq, isNumber } from "lodash";
import { t } from "../../i18next_wrapper";
import { DIGITAL } from "farmbot";
import { isBotOnline } from "../../devices/must_be_online";
import { getStatus } from "../../connectivity/reducer_support";
import { BoxTop } from "../../settings/pin_bindings/box_top";
import { BooleanSetting } from "../../session_keys";

export class Peripherals
  extends React.Component<PeripheralsProps, PeripheralState> {
  constructor(props: PeripheralsProps) {
    super(props);
    this.state = { isEditing: false };
  }

  get botOnline() {
    const { hardware, connectivity } = this.props.bot;
    const { sync_status } = hardware.informational_settings;
    const botToMqttStatus = getStatus(connectivity.uptime["bot.mqtt"]);
    return isBotOnline(sync_status, botToMqttStatus);
  }

  get disabled() {
    return !!this.props.bot.hardware.informational_settings.busy
      || !this.botOnline;
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
  };

  showPins = () => {
    const { peripherals, dispatch, bot } = this.props;

    const pins = bot.hardware.pins;
    if (this.state.isEditing) {
      return <PeripheralForm peripherals={peripherals}
        dispatch={dispatch} />;
    } else {
      return <PeripheralList peripherals={peripherals}
        dispatch={dispatch}
        pins={pins}
        disabled={this.disabled}
        locked={bot.hardware.informational_settings.locked} />;
    }
  };

  newPeripheral = (
    pin: number | undefined = undefined,
    label = t("New Peripheral"),
  ) => {
    this.props.dispatch(init("Peripheral", { pin, label, mode: DIGITAL }));
  };

  get stockPeripherals() {
    const BASE_PERIPHERALS = [
      { pin: 7, label: t("Lighting") },
      { pin: 8, label: t("Water") },
      { pin: 9, label: t("Vacuum") },
    ];
    const ROTARY_TOOL = [
      { pin: 2, label: t("Rotary Tool") },
      { pin: 3, label: t("Rotary Tool Reverse") },
    ];
    const EXTRA_PERIPHERALS = [
      { pin: 10, label: t("Peripheral ") + "4" },
      { pin: 12, label: t("Peripheral ") + "5" },
    ];
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
          ...BASE_PERIPHERALS,
          ...EXTRA_PERIPHERALS,
        ];
      case "farmduino_k16":
      case "farmduino_k17":
      case "farmduino_k18":
        return [
          ...BASE_PERIPHERALS,
          ...ROTARY_TOOL,
          ...EXTRA_PERIPHERALS,
        ];
      case "express_k10":
      case "express_k11":
      case "express_k12":
        return BASE_PERIPHERALS;
    }
  }

  render() {
    const { isEditing } = this.state;
    const status = getArrayStatus(this.props.peripherals);
    const editButtonText = isEditing
      ? t("Back")
      : t("Edit");
    return <div className={"peripherals-widget grid"}>
      {!this.props.hidePinBindings &&
        <BoxTop
          threeDimensions={!!this.props.getConfigValue(
            BooleanSetting.enable_3d_electronics_box_top)}
          isEditing={isEditing}
          dispatch={this.props.dispatch}
          resources={this.props.resources}
          firmwareHardware={this.props.firmwareHardware}
          bot={this.props.bot}
          botOnline={this.botOnline} />}
      <EmptyStateWrapper
        notEmpty={this.props.peripherals.length > 0 || isEditing}
        graphic={EmptyStateGraphic.regimens}
        title={t("No Peripherals yet.")}
        text={Content.NO_PERIPHERALS}
        colorScheme={"peripherals"}>
        {this.showPins()}
      </EmptyStateWrapper>
      <div className={"peripherals-buttons"}>
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
          title={t("add peripheral")}
          onClick={() => this.newPeripheral()}>
          <i className="fa fa-plus" />
        </button>
        <button
          hidden={!isEditing || this.props.firmwareHardware == "none"}
          className="fb-button green"
          type="button"
          title={t("add stock peripherals")}
          onClick={() => this.stockPeripherals.map(p =>
            this.newPeripheral(p.pin, p.label))}>
          <i className="fa fa-plus" style={{ marginRight: "0.5rem" }} />
          {t("Stock")}
        </button>
      </div>
    </div>;
  }
}
