import * as React from "react";
import { BotState } from "../interfaces";
import { Diagnosis, DiagnosisProps } from "./diagnosis";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { Row, Col } from "../../ui";
import { ConnectivityDiagram } from "./diagram";
import {
  ChipTemperatureDisplay, WiFiStrengthDisplay
} from "../components/fbos_settings/fbos_details";
import { t } from "../../i18next_wrapper";

export interface ConnectivityProps {
  bot: BotState;
  rowData: StatusRowProps[];
  flags: DiagnosisProps;
}

interface ConnectivityState {
  hoveredConnection: string | undefined;
}

export class Connectivity
  extends React.Component<ConnectivityProps, ConnectivityState> {
  state: ConnectivityState = { hoveredConnection: undefined };

  hover = (name: string) =>
    () => this.setState({ hoveredConnection: name });

  render() {
    const { soc_temp, wifi_level } = this.props.bot.hardware.informational_settings;
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
            <WiFiStrengthDisplay wifiStrength={wifi_level} />
          </div>
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
