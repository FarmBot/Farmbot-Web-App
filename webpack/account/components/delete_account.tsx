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
import { DeleteAccountPropTypes } from "../interfaces";
import { Content } from "../../constants";

export class DeleteAccount extends React.Component<DeleteAccountPropTypes, {}> {
  render() {
    let { onChange, deletion_confirmation, onClick } = this.props;
    return <Widget>
      <WidgetHeader title="Delete Account" />
      <WidgetBody>
        <div>
          {Content.ACCOUNT_DELETE_WARNING}
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
                onCommit={onChange}
                name="deletion_confirmation"
                allowEmpty={true}
                value={deletion_confirmation || ""}
                type="password" />
            </Col>
            <Col xs={4}>
              <button
                onClick={onClick}
                className="red fb-button"
                type="button"
              >
                {t("Delete Account")}
              </button>
            </Col>
          </Row>
        </form>
      </WidgetBody>
    </Widget>;
  }
}
