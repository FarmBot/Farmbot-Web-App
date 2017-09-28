import * as React from "react";
import { Widget, WidgetHeader, WidgetBody } from "../../ui/index";
import { t } from "i18next";
import { ConnectivityRow, StatusRowProps } from "./connectivity_row";
import { RetryBtn } from "./retry_btn";
import { SpecialStatus } from "../../resources/tagged_resources";

interface Props {
  onRefresh(): void;
  rowData: StatusRowProps[];
  children?: React.ReactChild;
  status: SpecialStatus | undefined;
}

interface State {

}

export class ConnectivityPanel extends React.Component<Props, State> {
  state: State = {};

  render() {
    const { rowData } = this.props;
    return <Widget className="device-widget">
      <WidgetHeader
        title={t("Connectivity")}
        helpText={t("Diagnose connectivity issues with FarmBot and the browser.")}>
        <RetryBtn
          status={this.props.status}
          onClick={this.props.onRefresh}
          flags={rowData.map(x => !!x.connectionStatus)} />
      </WidgetHeader>
      <WidgetBody>
        <ConnectivityRow from="from" to="to" />
        {rowData
          .map((x, y) => <ConnectivityRow {...x} key={y} />)}
        <hr style={{ marginLeft: "3rem" }} />
        {this.props.children}
      </WidgetBody>
    </Widget>;
  }
}
