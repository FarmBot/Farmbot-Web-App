import * as React from "react";
import { BotState } from "../interfaces";
import { Diagnosis, DiagnosisProps } from "./diagnosis";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { Row, Col } from "../../ui";
import { ConnectivityDiagram } from "./diagram";
import {
  ChipTemperatureDisplay, WiFiStrengthDisplay, VoltageDisplay
} from "../components/fbos_settings/fbos_details";
import { t } from "../../i18next_wrapper";
import { QosPanel } from "./qos_panel";
import { PingDictionary } from "./qos";

export interface ConnectivityProps {
  bot: BotState;
  rowData: StatusRowProps[];
  flags: DiagnosisProps;
  pings: PingDictionary;
}

interface ConnectivityState {
  hoveredConnection: string | undefined;
}

export class Connectivity
  extends React.Component<ConnectivityProps, ConnectivityState> {
  state: ConnectivityState = { hoveredConnection: undefined };

  hover = (connectionName: string) =>
    () => this.setState({ hoveredConnection: connectionName });

  render() {
    const { informational_settings } = this.props.bot.hardware;
    const {
      soc_temp, wifi_level, throttled, wifi_level_percent
    } = informational_settings;
    return <div className="connectivity">
      <Row>
        <Col md={12} lg={4}>
          <ConnectivityDiagram
            rowData={this.props.rowData}
            hover={this.hover}
            hoveredConnection={this.state.hoveredConnection} />
          <div className="fbos-info">
            <label>{t("Raspberry Pi Info")}</label>
            <ChipTemperatureDisplay temperature={soc_temp} />
            <WiFiStrengthDisplay wifiStrength={wifi_level}
              wifiStrengthPercent={wifi_level_percent} />
            <VoltageDisplay throttled={throttled} />
          </div>
          <QosPanel pings={this.props.pings} />
        </Col>
        <Col md={12} lg={8}>
          <ConnectivityRow from={t("from")} to={t("to")} header={true} />
          {this.props.rowData
            .map((x, y) => <ConnectivityRow {...x} key={y}
              hover={this.hover}
              hoveredConnection={this.state.hoveredConnection} />)}
          <hr style={{ marginLeft: "3rem" }} />
          <Diagnosis {...this.props.flags} />
        </Col>
      </Row>
    </div>;
  }
}
