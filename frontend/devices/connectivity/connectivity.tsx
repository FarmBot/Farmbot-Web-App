import React from "react";
import { BotState } from "../interfaces";
import { Diagnosis, ConnectionStatusFlags, getDiagnosisCode } from "./diagnosis";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { Row, Col } from "../../ui";
import { ConnectivityDiagram } from "./diagram";
import {
  ChipTemperatureDisplay, WiFiStrengthDisplay, VoltageDisplay,
  reformatFwVersion, reformatFbosVersion, LocalIpAddress, MacAddress, isWifi,
  MemoryUsageDisplay,
  CameraIndicator,
  PiDisplay,
} from "../../settings/fbos_settings/fbos_details";
import { t } from "../../i18next_wrapper";
import { QosPanel } from "./qos_panel";
import { PingDictionary } from "./qos";
import { refresh } from "../../api/crud";
import { TaggedDevice, Alert, FirmwareHardware, TaggedTelemetry } from "farmbot";
import { firmwareAlerts, FirmwareAlerts } from "../../messages/alerts";
import { MetricPanelState, TimeSettings } from "../../interfaces";
import { getKitName } from "../../settings/firmware/firmware_hardware_support";
import { FlashFirmwareBtn } from "../../settings/firmware/firmware_hardware_status";
import { restartFirmware, sync } from "../actions";
import { FbosMetricHistoryTable } from "./fbos_metric_history_table";
import { Actions } from "../../constants";

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
  telemetry: TaggedTelemetry[];
  metricPanelState: MetricPanelState;
}

interface ConnectivityState {
  hoveredConnection: string | undefined;
}

export class Connectivity
  extends React.Component<ConnectivityProps, ConnectivityState> {
  state: ConnectivityState = {
    hoveredConnection: undefined,
  };

  componentDidMount = () => {
    this.props.dispatch(refresh(this.props.device));
    this.props.dispatch(sync());
  };

  hover = (connectionName: string) =>
    () => this.setState({ hoveredConnection: connectionName });

  setHistoryOpen = (action: boolean) => () => {
    const historyOpen = this.props.metricPanelState.history;
    if ((action && !historyOpen) || (!action && historyOpen)) {
      this.togglePanelState("history");
    }
  };

  togglePanelState = (key: keyof MetricPanelState) =>
    this.props.dispatch({
      type: Actions.TOGGLE_METRIC_PANEL_OPTION,
      payload: key,
    });

  Realtime = () => {
    const { informational_settings } = this.props.bot.hardware;
    const {
      soc_temp, wifi_level, throttled, wifi_level_percent, controller_version,
      firmware_version, private_ip, node_name, target, memory_usage, sync_status,
      video_devices,
    } = informational_settings;
    const { id, fbos_version } = this.props.device.body;
    return <div className={"realtime-wrapper"}>
      <Col md={12} lg={4} className={"connectivity-left-column"}>
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
          <MemoryUsageDisplay usage={memory_usage} />
          <WiFiStrengthDisplay wifiStrength={wifi_level}
            wifiStrengthPercent={wifi_level_percent} />
          <MacAddress nodeName={node_name} target={target}
            wifi={isWifi(wifi_level, wifi_level_percent)} />
          <LocalIpAddress address={private_ip} />
          <VoltageDisplay throttleData={throttled} />
          <CameraIndicator videoDevices={video_devices} />
          <PiDisplay chip={target} firmware={this.props.apiFirmwareValue} />
          <p><b>{t("Connectivity code")}: </b>{
            getDiagnosisCode(this.props.flags)}</p>
        </div>
        <QosPanel pings={this.props.pings} />
      </Col>
      <Col md={12} lg={8} className={"connectivity-right-column"}>
        <ConnectivityRow from={t("from")} to={t("to")} header={true} />
        {this.props.rowData
          .map((statusRowProps, index) =>
            <ConnectivityRow {...statusRowProps} key={index}
              syncStatus={statusRowProps.connectionName == "botAPI"
                ? sync_status
                : undefined}
              hover={this.hover}
              hoveredConnection={this.state.hoveredConnection} />)}
        <hr style={{ marginLeft: "3rem" }} />
        <Diagnosis statusFlags={this.props.flags} />
        {this.props.flags.userAPI && this.props.flags.userMQTT
          && this.props.flags.botAPI && this.props.flags.botMQTT
          && this.props.apiFirmwareValue
          && !this.props.flags.botFirmware &&
          <div className={"fix-firmware-buttons"}>
            <Col xs={6}>
              <FlashFirmwareBtn
                apiFirmwareValue={this.props.apiFirmwareValue}
                botOnline={true} />
            </Col>
            <Col xs={6}>
              <button
                className={"fb-button yellow"}
                type={"button"}
                onClick={() => { restartFirmware(); }}
                title={t("restart firmware")}>
                {t("restart firmware")}
              </button>
            </Col>
          </div>}
      </Col>
    </div>;
  };

  render() {
    const historyOpen = this.props.metricPanelState.history;
    return <div className="connectivity">
      <Row className={"connectivity-content"}>
        <div className={"tabs"}>
          <label className={historyOpen ? "" : "selected"}
            onClick={this.setHistoryOpen(false)}>{t("realtime")}</label>
          <label className={historyOpen ? "selected" : ""}
            onClick={this.setHistoryOpen(true)}>{t("history")}</label>
        </div>
        {historyOpen
          ? <FbosMetricHistoryTable telemetry={this.props.telemetry}
            timeSettings={this.props.timeSettings} />
          : <this.Realtime />}
      </Row>
      {firmwareAlerts(this.props.alerts).length > 0 &&
        <Row>
          <FirmwareAlerts
            alerts={this.props.alerts}
            dispatch={this.props.dispatch}
            apiFirmwareValue={this.props.apiFirmwareValue}
            timeSettings={this.props.timeSettings} />
        </Row>}
    </div>;
  }
}
