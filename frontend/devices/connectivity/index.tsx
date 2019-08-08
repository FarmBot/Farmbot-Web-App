import * as React from "react";
import { Widget, WidgetHeader, WidgetBody } from "../../ui";
import { RetryBtn } from "./retry_btn";
import { SpecialStatus, TaggedDevice } from "farmbot";
import { ToolTips } from "../../constants";
import { t } from "../../i18next_wrapper";
import { Connectivity } from "./connectivity";
import { BotState } from "../interfaces";
import { connectivityData } from "./generate_data";
import { resetConnectionInfo } from "../actions";

interface Props {
  status: SpecialStatus;
  dispatch: Function;
  bot: BotState;
  deviceAccount: TaggedDevice;
}

export class ConnectivityPanel extends React.Component<Props, {}> {
  get data() {
    return connectivityData({
      bot: this.props.bot, device: this.props.deviceAccount
    });
  }

  refresh = () => this.props.dispatch(resetConnectionInfo());

  render() {
    return <Widget className="connectivity-widget">
      <WidgetHeader
        title={t("Connectivity")}
        helpText={ToolTips.CONNECTIVITY}>
        <RetryBtn
          status={this.props.status}
          onClick={this.refresh}
          flags={this.data.rowData.map(x => !!x.connectionStatus)} />
      </WidgetHeader>
      <WidgetBody>
        <Connectivity
          bot={this.props.bot}
          rowData={this.data.rowData}
          flags={this.data.flags} />
      </WidgetBody>
    </Widget>;
  }
}
