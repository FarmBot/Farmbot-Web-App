import * as React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../../ui/index";
import { t } from "i18next";
import { info } from "farmbot-toastr";
import { FirmwareHardware } from "farmbot";
import { ColWidth } from "../farmbot_os_settings";
import { updateConfig } from "../../actions";
import { BoardTypeProps } from "./interfaces";

const FIRMWARE_CHOICES = [
  { label: "Arduino/RAMPS (Genesis v1.2)", value: "arduino" },
  { label: "Farmduino (Genesis v1.3)", value: "farmduino" }
];

const FIRMWARE_CHOICES_DDI = {
  [FIRMWARE_CHOICES[0].value]: {
    label: FIRMWARE_CHOICES[0].label,
    value: FIRMWARE_CHOICES[0].value
  },
  [FIRMWARE_CHOICES[1].value]: {
    label: FIRMWARE_CHOICES[1].label,
    value: FIRMWARE_CHOICES[1].value
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

  get boardType() {
    if (this.props.firmwareVersion) {
      const boardIdentifier = this.props.firmwareVersion.slice(-1);
      switch (boardIdentifier) {
        case "R":
          return "Arduino/RAMPS";
        case "F":
          return "Farmduino";
        case "!":
          return "unknown";
        default:
          return "Present";
      }
    } else {
      return "unknown";
    }
  }

  get selectedBoard(): DropDownItem | undefined {
    switch (this.state.boardType) {
      case "Arduino/RAMPS":
      case "Present":
        return FIRMWARE_CHOICES_DDI["arduino"];
      case "Farmduino":
        return FIRMWARE_CHOICES_DDI["farmduino"];
      default:
        return undefined;
    }
  }

  sendOffConfig = (selectedItem: DropDownItem) => {
    // tslint:disable-next-line:no-any
    const isFwHardwareValue = (x?: any): x is FirmwareHardware => {
      const values: FirmwareHardware[] = ["arduino", "farmduino"];
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
            list={FIRMWARE_CHOICES}
            selectedItem={this.selectedBoard}
            onChange={this.sendOffConfig} />
        </div>
      </Col>
    </Row>;
  }
}
