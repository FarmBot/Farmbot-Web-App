import * as React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../../ui";
import { info } from "farmbot-toastr";
import { FirmwareHardware } from "farmbot";
import { ColWidth } from "../farmbot_os_settings";
import { updateConfig } from "../../actions";
import { BoardTypeProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { FirmwareHardwareStatus } from "./firmware_hardware_status";
import { Feature } from "../../interfaces";

const ARDUINO = { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" };
const FARMDUINO = { label: "Farmduino (Genesis v1.3)", value: "farmduino" };
const FARMDUINO_K14 = {
  label: "Farmduino (Genesis v1.4)", value: "farmduino_k14"
};
const EXPRESS_K10 = {
  label: "Farmduino (Express v1.0)", value: "express_k10"
};

export const FIRMWARE_CHOICES_DDI = {
  [ARDUINO.value]: ARDUINO,
  [FARMDUINO.value]: FARMDUINO,
  [FARMDUINO_K14.value]: FARMDUINO_K14,
  [EXPRESS_K10.value]: EXPRESS_K10,
};

export const isFwHardwareValue = (x?: unknown): x is FirmwareHardware => {
  const values: FirmwareHardware[] = [
    "arduino", "farmduino", "farmduino_k14", "express_k10"];
  return !!values.includes(x as FirmwareHardware);
};

export const boardType =
  (firmwareVersion: string | undefined): FirmwareHardware | "unknown" => {
    if (firmwareVersion) {
      const boardIdentifier = firmwareVersion.slice(-1);
      switch (boardIdentifier) {
        case "R":
          return "arduino";
        case "F":
          return "farmduino";
        case "G":
          return "farmduino_k14";
        case "E":
          return "express_k10";
        default:
          return "unknown";
      }
    } else {
      return "unknown";
    }
  };

interface BoardTypeState { boardType: string, sending: boolean }

export class BoardType extends React.Component<BoardTypeProps, BoardTypeState> {
  state = {
    boardType: this.boardType,
    sending: this.sending
  };

  componentWillReceiveProps() {
    this.setState({ sending: this.sending });
    !["unknown", "Present"].includes(this.boardType) &&
      this.setState({ boardType: this.boardType });
  }

  get sending() {
    return !this.props.sourceFbosConfig("firmware_hardware").consistent;
  }

  get apiValue(): FirmwareHardware | undefined {
    const { value } = this.props.sourceFbosConfig("firmware_hardware");
    return isFwHardwareValue(value) ? value : undefined;
  }

  get firmwareChoices() {
    const { shouldDisplay } = this.props;
    return [ARDUINO, FARMDUINO, FARMDUINO_K14,
      ...(shouldDisplay(Feature.express_k10) ? [EXPRESS_K10] : [])];
  }

  get firmwareVersion() {
    return this.props.bot.hardware.informational_settings.firmware_version;
  }

  get boardType() { return boardType(this.firmwareVersion); }

  get selectedBoard(): DropDownItem | undefined {
    switch (this.state.boardType) {
      case "arduino":
        return FIRMWARE_CHOICES_DDI["arduino"];
      case "farmduino":
        return FIRMWARE_CHOICES_DDI["farmduino"];
      case "farmduino_k14":
        return FIRMWARE_CHOICES_DDI["farmduino_k14"];
      case "express_k10":
        return FIRMWARE_CHOICES_DDI["express_k10"];
      case "unknown":
        // If unknown/disconnected, display API FirmwareHardware value if valid
        return (this.sending && this.apiValue)
          ? FIRMWARE_CHOICES_DDI[this.apiValue]
          : undefined;
      default:
        return undefined;
    }
  }

  sendOffConfig = (selectedItem: DropDownItem) => {
    const firmware_hardware = selectedItem.value;
    if (selectedItem && isFwHardwareValue(firmware_hardware)) {
      info(t("Sending firmware configuration..."), t("Sending"));
      this.props.dispatch(updateConfig({ firmware_hardware }));
      this.setState({ sending: true });
      this.forceUpdate();
    }
  }

  render() {
    return <Row>
      <Col xs={ColWidth.label}>
        <label>
          {t("FIRMWARE")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <div>
          <FBSelect
            key={this.state.boardType}
            extraClass={this.state.sending ? "dim" : ""}
            list={this.firmwareChoices}
            selectedItem={this.selectedBoard}
            onChange={this.sendOffConfig} />
        </div>
      </Col>
      <Col xs={ColWidth.button}>
        <FirmwareHardwareStatus
          botOnline={this.props.botOnline}
          apiFirmwareValue={this.apiValue}
          bot={this.props.bot}
          dispatch={this.props.dispatch}
          timeSettings={this.props.timeSettings}
          shouldDisplay={this.props.shouldDisplay} />
      </Col>
    </Row>;
  }
}
