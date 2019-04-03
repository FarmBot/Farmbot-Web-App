import * as React from "react";

import {
  Widget,
  WidgetHeader,
  WidgetBody,
  Col,
  Row
} from "../../ui/index";
import { DeleteAccountProps, DeleteAccountState } from "../interfaces";
import { Content } from "../../constants";
import { BlurablePassword } from "../../ui/blurable_password";
import { t } from "../../i18next_wrapper";

export class DeleteAccount extends
  React.Component<DeleteAccountProps, DeleteAccountState> {
  state: DeleteAccountState = { password: "" };

  componentWillUnmount() {
    this.setState({ password: "" });
  }

  render() {
    return <Widget>
      <WidgetHeader title="Delete Account" />
      <WidgetBody>
        <div>
          {t(Content.ACCOUNT_DELETE_WARNING)}
          <br /><br />
          {t(Content.TYPE_PASSWORD_TO_DELETE)}
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
                onCommit={(e) => {
                  this.setState({ password: e.currentTarget.value });
                }} />
            </Col>
            <Col xs={4}>
              <button
                onClick={() => this.props.onClick(this.state.password)}
                className="red fb-button"
                type="button" >
                {t("Delete Account")}
              </button>
            </Col>
          </Row>
        </form>
      </WidgetBody>
    </Widget>;
  }
}
