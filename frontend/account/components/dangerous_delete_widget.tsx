import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, Col, Row } from "../../ui";
import { DangerousDeleteProps, DangerousDeleteState } from "../interfaces";
import { BlurablePassword } from "../../ui/blurable_password";
import { t } from "../../i18next_wrapper";

/** Widget for permanently deleting large amounts of user data. */
export class DangerousDeleteWidget extends
  React.Component<DangerousDeleteProps, DangerousDeleteState> {
  state: DangerousDeleteState = { password: "" };

  componentWillUnmount() {
    this.setState({ password: "" });
  }

  onClick = () =>
    this.props.dispatch(this.props.onClick({ password: this.state.password }));

  render() {
    return <Widget>
      <WidgetHeader title={this.props.title} />
      <WidgetBody>
        <div>
          {t(this.props.warning)}
          <br /><br />
          {t(this.props.confirmation)}
          <br /><br />
        </div>
        <form>
          <Row>
            <Col xs={12}>
              <label>
                {t("Enter Password")}
              </label>
            </Col>
            <Col xs={8}>
              <BlurablePassword
                onCommit={e =>
                  this.setState({ password: e.currentTarget.value })} />
            </Col>
            <Col xs={4}>
              <button
                onClick={this.onClick}
                className="red fb-button"
                type="button">
                {t(this.props.title)}
              </button>
            </Col>
          </Row>
        </form>
      </WidgetBody>
    </Widget>;
  }
}
