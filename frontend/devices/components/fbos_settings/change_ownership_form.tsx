import * as React from "react";
import { Row, Col, BlurableInput } from "../../../ui/index";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { getDevice } from "../../../device";
import { transferOwnership } from "../../transfer_ownership/transfer_ownership";
import { API } from "../../../api";
import { NonsecureContentWarning } from "./nonsecure_content_warning";
import { Content } from "../../../constants";
import { BlurablePassword } from "../../../ui/blurable_password";

interface ChangeOwnershipFormState {
  email: string;
  password: string;
}

export function submitOwnershipChange(input: ChangeOwnershipFormState) {
  const { email, password } = input;
  const p = { email, password, device: getDevice() };
  const ok = () => success(t("Received change of ownership."));
  const no = () => error(t("Bad username or password"));
  return transferOwnership(p).then(ok, no);
}

export class ChangeOwnershipForm
  extends React.Component<{}, ChangeOwnershipFormState> {

  state: ChangeOwnershipFormState = { email: "", password: "" };

  render() {
    return <div className={"change-ownership-form"}>
      <Row>
        <p>
          {t("Change the account FarmBot is connected to.")}
        </p>
        <Col xs={4}>
          <label>
            {t("Email")}
          </label>
        </Col>
        <Col xs={8}>
          <BlurableInput
            allowEmpty={true}
            onCommit={e => this.setState({ email: e.currentTarget.value })}
            name="email"
            value={this.state.email}
            type="email" />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <label>
            {t("Password")}
          </label>
        </Col>
        <Col xs={8}>
          <BlurablePassword
            onCommit={e => this.setState({ password: e.currentTarget.value })}
            name="password" />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <label>
            {t("Server")}
          </label>
        </Col>
        <Col xs={8}>
          <BlurableInput
            allowEmpty={true}
            onCommit={() => { }}
            name="server"
            disabled={true}
            value={API.current.baseUrl}
            type="text" />
        </Col>
      </Row>
      <Row>
        <NonsecureContentWarning urls={[API.current.baseUrl, location.protocol]}>
          <Col xs={12}>
            <strong>
              {t(Content.NOT_HTTPS)}
            </strong>
            <p>
              {t(Content.CONTACT_SYSADMIN)}
            </p>
          </Col>
        </NonsecureContentWarning>
      </Row>
      <Row>
        <button
          className={"fb-button gray"}
          onClick={() => submitOwnershipChange(this.state)}>
          {t("submit")}
        </button>
      </Row>
    </div>;
  }
}
