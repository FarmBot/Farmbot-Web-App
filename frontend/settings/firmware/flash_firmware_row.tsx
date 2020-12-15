import React from "react";
import { Row, Col } from "../../ui/index";
import { DeviceSetting } from "../../constants";
import { FlashFirmwareRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { trim } from "../../util";
import { FlashFirmwareBtn, lookup } from "./firmware_hardware_status";

export class FlashFirmwareRow extends React.Component<FlashFirmwareRowProps> {

  Description = () =>
    <p>
      {trim(`${t("Flash the")} ${lookup(this.props.firmwareHardware) || ""}
  ${t("firmware to your device")}:`)}
    </p>;

  render() {
    return <Highlight settingName={DeviceSetting.flashFirmware}>
      <Row>
        <Col xs={6}>
          <label>
            {t(DeviceSetting.flashFirmware)}
          </label>
        </Col>
        <Col xs={6}>
          <FlashFirmwareBtn
            apiFirmwareValue={this.props.firmwareHardware}
            botOnline={this.props.botOnline} />
        </Col>
      </Row>
      <Row>  <this.Description />  </Row>
    </Highlight>;
  }
}
