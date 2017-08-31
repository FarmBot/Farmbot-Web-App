import * as React from "react";
import { t } from "i18next";
import {
  BlurableInput,
  Widget,
  WidgetHeader,
  WidgetBody,
  Col,
  Row
} from "../../ui";
import { DeleteAccountProps, DeleteAccountState } from "../interfaces";
import { Content } from "../../constants";

export class DeleteAccount extends
  React.Component<DeleteAccountProps, DeleteAccountState> {
  state: DeleteAccountState = { password: "" };

  render() {
    return <Widget>
      <WidgetHeader title="Delete Account" />
      <WidgetBody>
        <div>
          {t(Content.ACCOUNT_DELETE_WARNING)}
          <br /><br />
          {t(`If you are sure you want to delete your account, type in
              your password below to continue.`)}
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
              <BlurableInput
                onCommit={(e) => {
                  this.setState({ password: e.currentTarget.value });
                }}
                allowEmpty={true}
                value={this.state.password}
                type="password" />
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
