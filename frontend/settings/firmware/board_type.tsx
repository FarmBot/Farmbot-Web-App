import React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../ui";
import { info, warning } from "../../toast/toast";
import { updateConfig } from "../../devices/actions";
import { BoardTypeProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import {
  FirmwareHardwareStatus, FlashFirmwareBtn,
} from "./firmware_hardware_status";
import {
  isFwHardwareValue, getFirmwareChoices, FIRMWARE_CHOICES_DDI, isUpgrade,
} from "./firmware_hardware_support";
import { Highlight } from "../maybe_highlight";
import { Content, DeviceSetting } from "../../constants";
import { getModifiedClassName } from "../fbos_settings/default_values";

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
      isUpgrade(this.props.firmwareHardware, firmware_hardware) &&
        warning(t(Content.FIRMWARE_UPGRADED),
          { title: t("Action may be required") });
      this.props.dispatch(updateConfig({ firmware_hardware }));
      this.forceUpdate();
    }
  };

  FirmwareSelection = () =>
    <FBSelect
      key={this.props.firmwareHardware + "" + this.sending}
      extraClass={[
        this.sending ? "dim" : "",
        getModifiedClassName("firmware_hardware", this.props.firmwareHardware),
      ].join(" ")}
      list={getFirmwareChoices()}
      selectedItem={this.selectedBoard}
      onChange={this.sendOffConfig} />;

  render() {
    return <Highlight settingName={DeviceSetting.firmware}>
      <Row>
        <Col xs={2}>
          <label>
            {t("FIRMWARE")}
          </label>
        </Col>
        <Col xs={1}>
          <FirmwareHardwareStatus
            botOnline={this.props.botOnline}
            apiFirmwareValue={this.props.firmwareHardware}
            alerts={this.props.alerts}
            bot={this.props.bot}
            dispatch={this.props.dispatch}
            timeSettings={this.props.timeSettings} />
        </Col>
        <Col xs={2}>
          <FlashFirmwareBtn
            short={true}
            apiFirmwareValue={this.props.firmwareHardware}
            botOnline={this.props.botOnline} />
        </Col>
        <Col xs={7} className="no-pad">
          <this.FirmwareSelection />
        </Col>
      </Row>
    </Highlight>;
  }
}
