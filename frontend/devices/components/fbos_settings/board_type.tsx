import * as React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../../ui";
import { info } from "../../../toast/toast";
import { FirmwareHardware } from "farmbot";
import { ColWidth } from "../farmbot_os_settings";
import { updateConfig } from "../../actions";
import { BoardTypeProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { FirmwareHardwareStatus } from "./firmware_hardware_status";
import {
  isFwHardwareValue, getFirmwareChoices, FIRMWARE_CHOICES_DDI
} from "../firmware_hardware_support";

interface BoardTypeState { sending: boolean }

export class BoardType extends React.Component<BoardTypeProps, BoardTypeState> {
  state = {
    sending: this.sending
  };

  UNSAFE_componentWillReceiveProps() {
    this.setState({ sending: this.sending });
  }

  get sending() {
    return !this.props.sourceFbosConfig("firmware_hardware").consistent;
  }

  get apiValue(): FirmwareHardware | undefined {
    const { value } = this.props.sourceFbosConfig("firmware_hardware");
    return isFwHardwareValue(value) ? value : undefined;
  }

  get selectedBoard(): DropDownItem | undefined {
    return this.apiValue ? FIRMWARE_CHOICES_DDI[this.apiValue] : undefined;
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
            key={this.apiValue}
            extraClass={this.state.sending ? "dim" : ""}
            list={getFirmwareChoices(this.props.shouldDisplay)}
            selectedItem={this.selectedBoard}
            onChange={this.sendOffConfig} />
        </div>
      </Col>
      <Col xs={ColWidth.button}>
        <FirmwareHardwareStatus
          botOnline={this.props.botOnline}
          apiFirmwareValue={this.apiValue}
          alerts={this.props.alerts}
          bot={this.props.bot}
          dispatch={this.props.dispatch}
          timeSettings={this.props.timeSettings}
          shouldDisplay={this.props.shouldDisplay} />
      </Col>
    </Row>;
  }
}
