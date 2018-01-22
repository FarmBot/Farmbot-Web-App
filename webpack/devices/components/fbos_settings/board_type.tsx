import * as React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../../ui/index";
import { t } from "i18next";
import { getDevice } from "../../../device";
import { info, error } from "farmbot-toastr";
import { FirmwareHardware } from "farmbot";
import { ColWidth } from "../farmbot_os_settings";

export interface BoardTypeProps {
  firmwareVersion: string | undefined;
}

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

export class BoardType
  extends React.Component<BoardTypeProps, {}> {

  getBoardType() {
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

  selectedBoard(): DropDownItem | undefined {
    const board = this.getBoardType();
    switch (board) {
      case "Arduino/RAMPS":
      case "Present":
        return FIRMWARE_CHOICES_DDI["arduino"];
      case "Farmduino":
        return FIRMWARE_CHOICES_DDI["farmduino"];
      default:
        return undefined;
    }
  }

  sendOffConfig = (selectedBoard: DropDownItem) => {
    // tslint:disable-next-line:no-any
    const isFwHardwareValue = (x?: any): x is FirmwareHardware => {
      const values: FirmwareHardware[] = ["arduino", "farmduino"];
      return !!values.includes(x as FirmwareHardware);
    };

    const firmware_hardware = selectedBoard.value;
    if (selectedBoard && isFwHardwareValue(firmware_hardware)) {
      info(t("Sending firmware configuration..."), t("Sending"));
      getDevice()
        .updateConfig({ firmware_hardware })
        .catch(() => error(t("An error occurred during configuration.")));
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
            key={this.getBoardType()}
            allowEmpty={true}
            list={FIRMWARE_CHOICES}
            selectedItem={this.selectedBoard()}
            placeholder={this.getBoardType()}
            onChange={this.sendOffConfig} />
        </div>
      </Col>
    </Row>;
  }
}
