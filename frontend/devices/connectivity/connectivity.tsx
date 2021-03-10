import React from "react";
import { BotState } from "../interfaces";
import { Diagnosis, ConnectionStatusFlags, getDiagnosisCode } from "./diagnosis";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { Row, Col } from "../../ui";
import { ConnectivityDiagram } from "./diagram";
import {
  ChipTemperatureDisplay, WiFiStrengthDisplay, VoltageDisplay,
  reformatFwVersion, reformatFbosVersion, LocalIpAddress, MacAddress, isWifi,
} from "../../settings/fbos_settings/fbos_details";
import { t } from "../../i18next_wrapper";
import { QosPanel } from "./qos_panel";
import { PingDictionary } from "./qos";
import { refresh } from "../../api/crud";
import { TaggedDevice, Alert, FirmwareHardware } from "farmbot";
import { FirmwareAlerts } from "../../messages/alerts";
import { TimeSettings } from "../../interfaces";
import { getKitName } from "../../settings/firmware/firmware_hardware_support";

export interface ConnectivityProps {
  bot: BotState;
  rowData: StatusRowProps[];
  flags: ConnectionStatusFlags;
  pings: PingDictionary;
  dispatch: Function;
  device: TaggedDevice;
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  timeSettings: TimeSettings;
}

interface ConnectivityState {
  hoveredConnection: string | undefined;
}

export class Connectivity
  extends React.Component<ConnectivityProps, ConnectivityState> {
  state: ConnectivityState = { hoveredConnection: undefined };

  componentDidMount = () => this.props.dispatch(refresh(this.props.device));

  hover = (connectionName: string) =>
    () => this.setState({ hoveredConnection: connectionName });

  render() {
    const { informational_settings } = this.props.bot.hardware;
    const {
      soc_temp, wifi_level, throttled, wifi_level_percent, controller_version,
      firmware_version, private_ip, node_name, target,
    } = informational_settings;
    const { id, fbos_version } = this.props.device.body;
    return <div className="connectivity">
      <Row>
        <Col md={12} lg={4}>
          <ConnectivityDiagram
            rowData={this.props.rowData}
            hover={this.hover}
            hoveredConnection={this.state.hoveredConnection} />
          <div className="fbos-info">
            <label>{t("FarmBot Info")}</label>
            <p><b>{t("Device ID")}: </b>{id}</p>
            {controller_version
              ? <p><b>{t("Version")}: </b>{
                reformatFbosVersion(controller_version)}</p>
              : <p><b>{t("Version last seen")}: </b>{
                reformatFbosVersion(fbos_version)}</p>}
            <p><b>{t("Model")}: </b>{getKitName(this.props.apiFirmwareValue)}</p>
            <p><b>{t("Firmware")}: </b>{reformatFwVersion(firmware_version)}</p>
            <ChipTemperatureDisplay temperature={soc_temp} />
            <WiFiStrengthDisplay wifiStrength={wifi_level}
              wifiStrengthPercent={wifi_level_percent} />
            <MacAddress nodeName={node_name} target={target}
              wifi={isWifi(wifi_level, wifi_level_percent)} />
            <LocalIpAddress address={private_ip} />
            <VoltageDisplay throttleData={throttled} />
            <p><b>{t("Connectivity code")}: </b>{
              getDiagnosisCode(this.props.flags)}</p>
          </div>
          <QosPanel pings={this.props.pings} />
        </Col>
        <Col md={12} lg={8}>
          <ConnectivityRow from={t("from")} to={t("to")} header={true} />
          {this.props.rowData
            .map((statusRowProps, index) =>
              <ConnectivityRow {...statusRowProps} key={index}
                hover={this.hover}
                hoveredConnection={this.state.hoveredConnection} />)}
          <hr style={{ marginLeft: "3rem" }} />
          <Diagnosis statusFlags={this.props.flags} />
        </Col>
      </Row>
      <Row>
        <FirmwareAlerts
          alerts={this.props.alerts}
          dispatch={this.props.dispatch}
          apiFirmwareValue={this.props.apiFirmwareValue}
          timeSettings={this.props.timeSettings} />
      </Row>
    </div>;
  }
}
