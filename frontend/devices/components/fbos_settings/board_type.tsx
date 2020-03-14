import * as React from "react";
import { Row, Col, DropDownItem, FBSelect } from "../../../ui";
import { info } from "../../../toast/toast";
import { ColWidth } from "../farmbot_os_settings";
import { updateConfig } from "../../actions";
import { BoardTypeProps } from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { FirmwareHardwareStatus } from "./firmware_hardware_status";
import {
  isFwHardwareValue, getFirmwareChoices, FIRMWARE_CHOICES_DDI,
} from "../firmware_hardware_support";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../../constants";
import { DevSettings } from "../../../account/dev/dev_support";

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

  get selectedBoard(): DropDownItem | undefined {
    return this.props.firmwareHardware
      ? FIRMWARE_CHOICES_DDI[this.props.firmwareHardware]
      : undefined;
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

  FirmwareSelection = () =>
    <FBSelect
      key={this.props.firmwareHardware}
      extraClass={this.state.sending ? "dim" : ""}
      list={getFirmwareChoices()}
      selectedItem={this.selectedBoard}
      onChange={this.sendOffConfig} />

  render() {
    const newFormat = DevSettings.futureFeaturesEnabled();
    return <Highlight settingName={DeviceSetting.firmware}>
      <Row>
        <Col xs={ColWidth.label}>
          <label>
            {t("FIRMWARE")}
          </label>
        </Col>
        {!newFormat &&
          <Col xs={ColWidth.description}>
            <this.FirmwareSelection />
          </Col>}
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
      {newFormat &&
        <Row>
          <Col xs={12} className="no-pad">
            <this.FirmwareSelection />
          </Col>
        </Row>}
    </Highlight>;
  }
}
