import React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../ui";
import { info } from "../../toast/toast";
import { ColWidth } from "../fbos_settings/farmbot_os_settings";
import { updateConfig } from "../../devices/actions";
import { BoardTypeProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { FirmwareHardwareStatus } from "./firmware_hardware_status";
import {
  isFwHardwareValue, getFirmwareChoices, FIRMWARE_CHOICES_DDI,
} from "./firmware_hardware_support";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";

export class BoardType extends React.Component<BoardTypeProps, {}> {
  get sending() {
    return !this.props.sourceFbosConfig("firmware_hardware").consistent;
  }

  get selectedBoard(): DropDownItem | undefined {
    return this.props.firmwareHardware
      ? FIRMWARE_CHOICES_DDI[this.props.firmwareHardware]
      : undefined;
  }

  sendOffConfig = (selectedItem: DropDownItem) => {
    const firmware_hardware = selectedItem.value;
    if (selectedItem && isFwHardwareValue(firmware_hardware)) {
      info(t("Sending firmware configuration..."), { title: t("Sending") });
      this.props.dispatch(updateConfig({ firmware_hardware }));
      this.forceUpdate();
    }
  }

  FirmwareSelection = () =>
    <FBSelect
      key={this.props.firmwareHardware + "" + this.sending}
      extraClass={this.sending ? "dim" : ""}
      list={getFirmwareChoices()}
      selectedItem={this.selectedBoard}
      onChange={this.sendOffConfig} />

  render() {
    return <Highlight settingName={DeviceSetting.firmware}>
      <Row>
        <Col xs={ColWidth.label}>
          <label>
            {t("FIRMWARE")}
          </label>
        </Col>
        <Col xs={ColWidth.button}>
          <FirmwareHardwareStatus
            botOnline={this.props.botOnline}
            apiFirmwareValue={this.props.firmwareHardware}
            alerts={this.props.alerts}
            bot={this.props.bot}
            dispatch={this.props.dispatch}
            timeSettings={this.props.timeSettings} />
        </Col>
      </Row>
      <Row>
        <Col xs={12} className="no-pad">
          <this.FirmwareSelection />
        </Col>
      </Row>
    </Highlight>;
  }
}
