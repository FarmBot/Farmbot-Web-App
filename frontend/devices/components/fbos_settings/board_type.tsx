import * as React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../../ui/index";

import { info } from "farmbot-toastr";
import { FirmwareHardware } from "farmbot";
import { ColWidth } from "../farmbot_os_settings";
import { updateConfig } from "../../actions";
import { BoardTypeProps } from "./interfaces";
import { Feature } from "../../interfaces";
import { t } from "../../../i18next_wrapper";

const ARDUINO = { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" };
const FARMDUINO = { label: "Farmduino (Genesis v1.3)", value: "farmduino" };
const FARMDUINO_K14 = {
  label: "Farmduino (Genesis v1.4)", value: "farmduino_k14"
};

const FIRMWARE_CHOICES_DDI = {
  [ARDUINO.value]: ARDUINO,
  [FARMDUINO.value]: FARMDUINO,
  [FARMDUINO_K14.value]: FARMDUINO_K14
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

  get apiValue() {
    return this.props.sourceFbosConfig("firmware_hardware").value;
  }

  get firmwareChoices() {
    const { shouldDisplay } = this.props;
    return [ARDUINO, FARMDUINO,
      ...(shouldDisplay(Feature.farmduino_k14) ? [FARMDUINO_K14] : [])
    ];
  }

  get boardType() {
    if (this.props.firmwareVersion) {
      const boardIdentifier = this.props.firmwareVersion.slice(-1);
      switch (boardIdentifier) {
        case "R":
          return "Arduino/RAMPS";
        case "F":
          return "Farmduino";
        case "G":
          return "Farmduino k1.4";
        default:
          return "unknown";
      }
    } else {
      return "unknown";
    }
  }

  get selectedBoard(): DropDownItem | undefined {
    switch (this.state.boardType) {
      case "Arduino/RAMPS":
        return FIRMWARE_CHOICES_DDI["arduino"];
      case "Farmduino":
        return FIRMWARE_CHOICES_DDI["farmduino"];
      case "Farmduino k1.4":
        return FIRMWARE_CHOICES_DDI["farmduino_k14"];
      case "unknown":
        // If unknown/disconnected, display API FirmwareHardware value if valid
        return (this.sending && typeof this.apiValue === "string")
          ? FIRMWARE_CHOICES_DDI[this.apiValue]
          : undefined;
      default:
        return undefined;
    }
  }

  sendOffConfig = (selectedItem: DropDownItem) => {
    const isFwHardwareValue = (x?: unknown): x is FirmwareHardware => {
      const values: FirmwareHardware[] = [
        "arduino", "farmduino", "farmduino_k14"];
      return !!values.includes(x as FirmwareHardware);
    };

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
    </Row>;
  }
}
