import * as React from "react";
import { connect } from "react-redux";
import { Col, Row, Page, ToolTip } from "../ui/index";
import { ToolTips } from "../constants";
import { t } from "../i18next_wrapper";
import { Alerts } from "./alerts";
import { mapStateToProps } from "./state_to_props";
import { MessagesProps } from "./interfaces";
import { Link } from "../link";

@connect(mapStateToProps)
export class Messages extends React.Component<MessagesProps, {}> {
  render() {
    return <Page className="messages-page">
      <Row>
        <Col xs={12}>
          <h3>
            <i>{t("Message Center")}</i>
          </h3>
          <ToolTip helpText={ToolTips.MESSAGES} />
        </Col>
      </Row>
      <Row>
        <Alerts alerts={this.props.alerts}
          dispatch={this.props.dispatch}
          apiFirmwareValue={this.props.apiFirmwareValue}
          timeSettings={this.props.timeSettings}
          findApiAlertById={this.props.findApiAlertById} />
      </Row>
      <Row>
        <div className="link-to-logs">
          {this.props.alerts.length > 0
            ? t("No more messages.") : t("No messages.")}
          &nbsp;<Link to="/app/logs">{t("View Logs")}</Link>
        </div>
      </Row>
    </Page>;
  }
}
