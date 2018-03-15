import * as React from "react";
import { Row, Col, BlurableInput } from "../../../ui/index";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { getDevice } from "../../../device";
import { transferOwnership } from "../../transfer_ownership/transfer_ownership";
import { API } from "../../../api";
import { NonsecureContentWarning } from "./nonsecure_content_warning";
import { Content } from "../../../constants";

interface ChangeOwnershipFormState {
  email: string;
  password: string;
  server: string;
}

export class ChangeOwnershipForm
  extends React.Component<{}, ChangeOwnershipFormState> {
  state = { email: "", password: "", server: API.current.baseUrl };

  submitOwnershipChange = () => {
    const { email, password, server } = this.state;
    const ok = () => success(t("Received change of ownership."));
    const no = () => error(t("Bad username or password"));
    transferOwnership({ email, password, server, device: getDevice() })
      .then(ok, no);
  }

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
          <BlurableInput
            allowEmpty={true}
            onCommit={e => this.setState({ password: e.currentTarget.value })}
            name="password"
            value={this.state.password}
            type="password" />
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
            onCommit={e => this.setState({ server: e.currentTarget.value })}
            name="server"
            disabled={true}
            value={this.state.server}
            type="text" />
        </Col>
      </Row>
      <Row>
        <NonsecureContentWarning urls={[API.current.baseUrl, this.state.server, location.protocol]}>
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
          onClick={this.submitOwnershipChange}>
          {t("submit")}
        </button>
      </Row>
    </div>;
  }
}
