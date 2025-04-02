import React from "react";
import { BotState } from "../interfaces";
import { Diagnosis, ConnectionStatusFlags, getDiagnosisCode } from "./diagnosis";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { Row, docLinkClick, Saucer } from "../../ui";
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
import { readStatus, restartFirmware, sync } from "../actions";
import { FbosMetricHistoryTable } from "./fbos_metric_history_table";
import { Actions } from "../../constants";
import { forceOnline } from "../must_be_online";
import { isMobile } from "../../screen_size";
import { NavigationContext } from "../../routes_helpers";

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
    if (forceOnline()) { return; }
    this.props.dispatch(refresh(this.props.device));
    this.props.dispatch(sync());
    readStatus();
  };

  hover = (connectionName: string) =>
    () => this.setState({ hoveredConnection: connectionName });

  setPanelState = (key: keyof MetricPanelState) => () =>
    this.props.dispatch({
      type: Actions.SET_METRIC_PANEL_OPTION,
      payload: key,
    });

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  Realtime = () => {
    const { informational_settings } = this.props.bot.hardware;
    const {
      soc_temp, throttled, controller_version,
      firmware_version, target, memory_usage, sync_status,
      video_devices,
    } = informational_settings;
    const { id, fbos_version } = this.props.device.body;
    return <div className={"realtime-wrapper"}>
      <div className={"connectivity-left-column"}>
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
          <VoltageDisplay throttleData={throttled} />
          <CameraIndicator videoDevices={video_devices} />
          <PiDisplay chip={target} firmware={this.props.apiFirmwareValue} />
          <p><b>{t("Connectivity code")}: </b>{
            getDiagnosisCode(this.props.flags)}</p>
        </div>
      </div>
      <div className={"connectivity-right-column"}>
        <ConnectivityRow from={t("from")} to={t("to")} header={true} />
        {this.props.rowData
          .map((statusRowProps, index) =>
            <ConnectivityRow {...statusRowProps} key={index}
              syncStatus={statusRowProps.connectionName == "botAPI"
                ? sync_status
                : undefined}
              hover={this.hover}
              hoveredConnection={this.state.hoveredConnection} />)}
        <Diagnosis statusFlags={this.props.flags} dispatch={this.props.dispatch} />
        {this.props.flags.userAPI && this.props.flags.userMQTT
          && this.props.flags.botAPI && this.props.flags.botMQTT
          && this.props.apiFirmwareValue
          && !this.props.flags.botFirmware &&
          <Row className={"fix-firmware-buttons"}>
            <FlashFirmwareBtn
              apiFirmwareValue={this.props.apiFirmwareValue}
              botOnline={true} />
            <button
              className={"fb-button yellow"}
              type={"button"}
              onClick={() => { restartFirmware(); }}
              title={t("restart firmware")}>
              {t("restart firmware")}
            </button>
          </Row>}
      </div>
    </div>;
  };

  Network = () => {
    const { flags } = this.props;
    const { informational_settings } = this.props.bot.hardware;
    const {
      wifi_level, wifi_level_percent, private_ip, node_name, target,
    } = informational_settings;
    const wifi = isWifi(wifi_level, wifi_level_percent);
    return <div className={"network-wrapper grid-3-col"}>
      <div className="fbos-info">
        <label>{t("FarmBot Connection")}</label>
        <p><b>{t("Connection type")}: </b>{wifi ? "WiFi" : t("Unknown")}</p>
        <WiFiStrengthDisplay wifiStrength={wifi_level}
          wifiStrengthPercent={wifi_level_percent} />
        <MacAddress nodeName={node_name} target={target} wifi={wifi} />
        <LocalIpAddress address={private_ip} />
      </div>
      <QosPanel pings={this.props.pings} dispatch={this.props.dispatch} />
      <div className="port-info">
        <label>{t("Ports")}</label>
        <i>{isMobile() ? t("This phone") : t("This computer")}</i>
        <PortRow port={"80 - HTTP"} status={flags["userAPI"]} />
        <PortRow port={"443 - HTTPS"} status={flags["userAPI"]} />
        <PortRow port={"3002 - WebSockets"} status={flags["userMQTT"]} />
        <i style={{ marginTop: "1rem" }}>{t("FarmBot")}</i>
        <PortRow port={"80 - HTTP"} status={flags["botAPI"]} />
        <PortRow port={"443 - HTTPS"} status={flags["botAPI"]} />
        <PortRow port={"8883 - MQTT"} status={flags["botMQTT"]} />
        <a onClick={docLinkClick({
          slug: "for-it-security-professionals",
          navigate: this.navigate,
          dispatch: this.props.dispatch,
        })}>
          <i className="fa fa-external-link" />
          {t("Learn more about ports")}
        </a>
      </div>
    </div>;
  };

  render() {
    const { realtime, network, history } = this.props.metricPanelState;
    return <div className="connectivity">
      <div className={"connectivity-content"}>
        <div className={"tabs"}>
          <label className={realtime ? "selected" : ""}
            onClick={this.setPanelState("realtime")}>{t("realtime")}</label>
          <label className={network ? "selected" : ""}
            onClick={this.setPanelState("network")}>{t("network")}</label>
          <label className={history ? "selected" : ""}
            onClick={this.setPanelState("history")}>{t("history")}</label>
        </div>
        {realtime && <this.Realtime />}
        {network && <this.Network />}
        {history && <FbosMetricHistoryTable telemetry={this.props.telemetry}
          timeSettings={this.props.timeSettings} />}
      </div>
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

interface PortRowProps {
  port: string;
  status: boolean;
}

const PortRow = (props: PortRowProps) => {
  return <div>
    <Saucer color={portStatus(props.status).color} />
    <p><b>{props.port}: </b><span>{portStatus(props.status).text}</span></p>
  </div>;
};

const portStatus = (status: boolean) => {
  switch (status) {
    case true: return { color: "green", text: t("Open") };
    // case false: return { color: "red", text: t("Closed") };
    default: return { color: "gray", text: t("Unknown") };
  }
};
