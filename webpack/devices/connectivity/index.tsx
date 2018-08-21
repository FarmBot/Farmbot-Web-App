import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../../ui/index";
import { t } from "i18next";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { RetryBtn } from "./retry_btn";
import { SpecialStatus, InformationalSettings } from "farmbot";
import { ConnectivityDiagram } from "./diagram";
import { ToolTips } from "../../constants";
import {
  ChipTemperatureDisplay, WiFiStrengthDisplay
} from "../components/fbos_settings/fbos_details";

interface Props {
  onRefresh(): void;
  rowData: StatusRowProps[];
  children?: React.ReactChild;
  status: SpecialStatus;
  fbosInfo: InformationalSettings;
}

interface ConnectivityState {
  hoveredConnection: string | undefined;
}

export class ConnectivityPanel extends React.Component<Props, ConnectivityState> {
  state: ConnectivityState = { hoveredConnection: undefined };

  hover = (name: string) =>
    () => this.setState({ hoveredConnection: name });

  render() {
    const { rowData } = this.props;
    const { soc_temp, wifi_level } = this.props.fbosInfo;
    return <Widget className="connectivity-widget">
      <WidgetHeader
        title={t("Connectivity")}
        helpText={ToolTips.CONNECTIVITY}>
        <RetryBtn
          status={this.props.status}
          onClick={this.props.onRefresh}
          flags={rowData.map(x => !!x.connectionStatus)} />
      </WidgetHeader>
      <WidgetBody>
        <Row>
          <Col md={12} lg={4}>
            <ConnectivityDiagram
              rowData={rowData}
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
            {rowData
              .map((x, y) => <ConnectivityRow {...x} key={y}
                hover={this.hover}
                hoveredConnection={this.state.hoveredConnection} />)}
            <hr style={{ marginLeft: "3rem" }} />
            {this.props.children}
          </Col>
        </Row>
      </WidgetBody>
    </Widget>;
  }
}
