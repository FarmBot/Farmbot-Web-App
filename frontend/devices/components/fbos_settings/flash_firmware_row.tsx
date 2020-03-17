import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { DeviceSetting } from "../../../constants";
import { ColWidth } from "../farmbot_os_settings";
import { FlashFirmwareRowProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DevSettings } from "../../../account/dev/dev_support";
import { trim } from "lodash";
import { FlashFirmwareBtn, lookup } from "./firmware_hardware_status";

export class FlashFirmwareRow extends React.Component<FlashFirmwareRowProps> {

  Description = () =>
    <p>
      {trim(`${t("Flash the")} ${lookup(this.props.firmwareHardware) || ""}
  ${t("firmware to your device")}:`)}
    </p>;

  render() {
    const newFormat = DevSettings.futureFeaturesEnabled();

    return <Highlight settingName={DeviceSetting.flashFirmware}>
      <Row>
        <Col xs={newFormat ? 6 : ColWidth.label}>
          <label>
            {t(DeviceSetting.flashFirmware)}
          </label>
        </Col>
        {!newFormat && <Col xs={ColWidth.description}>
          <this.Description />
        </Col>}
        <Col xs={newFormat ? 6 : ColWidth.button}>
          <FlashFirmwareBtn
            apiFirmwareValue={this.props.firmwareHardware}
            botOnline={this.props.botOnline} />
        </Col>
      </Row>
      {newFormat && <Row>  <this.Description />  </Row>}
    </Highlight>;
  }
}
