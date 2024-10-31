import React from "react";
import { connect } from "react-redux";
import { Alerts } from "../messages/alerts";
import { mapStateToProps } from "../messages/state_to_props";
import { MessagesProps } from "../messages/interfaces";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { t } from "../i18next_wrapper";
import { Link } from "../link";
import { Path } from "../internal_urls";

export class RawMessagesPanel
  extends React.Component<MessagesProps, {}> {

  render() {
    return <DesignerPanel panelName={"messages"} panel={Panel.Messages}>
      <DesignerPanelContent panelName={"messages"}>
        <Alerts alerts={this.props.alerts}
          dispatch={this.props.dispatch}
          apiFirmwareValue={this.props.apiFirmwareValue}
          timeSettings={this.props.timeSettings}
          findApiAlertById={this.props.findApiAlertById} />
        <div className="link-to-logs">
          {this.props.alerts.length > 0
            ? t("No more messages.")
            : t("No messages.")}
          &nbsp;<Link to={Path.logs()}>{t("View Logs")}</Link>
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const MessagesPanel = connect(mapStateToProps)(RawMessagesPanel);
// eslint-disable-next-line import/no-default-export
export default MessagesPanel;
