import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../../ui/index";
import { t } from "i18next";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { RetryBtn } from "./retry_btn";
import { SpecialStatus } from "../../resources/tagged_resources";
import { ConnectivityDiagram } from "./diagram";
import { ToolTips } from "../../constants";

interface Props {
  onRefresh(): void;
  rowData: StatusRowProps[];
  children?: React.ReactChild;
  status: SpecialStatus;
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
          </Col>
          <Col md={12} lg={8}>
            <ConnectivityRow from={t("from")} to={t("to")} />
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
