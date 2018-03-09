import * as React from "react";
import { Row, Col, BlurableInput } from "../../../ui/index";
import { t } from "i18next";
import { info, success } from "farmbot-toastr";
import { getDevice } from "../../../device";
import { rpcRequest } from "farmbot";

interface ChangeOwnershipFormState {
  email: string;
  password: string;
  server: string;
}

export class ChangeOwnershipForm
  extends React.Component<{}, ChangeOwnershipFormState> {
  state = {
    email: "",
    password: "",
    server: "https://my.farm.bot"
  };

  submitOwnershipChange = () => {
    info(t("Sending change of ownership..."), t("Sending"));
    getDevice()
      .send(rpcRequest([
        { kind: "pair", args: { label: "email", value: this.state.email } },
        { kind: "pair", args: { label: "secret", value: 0 } },
        { kind: "pair", args: { label: "server", value: this.state.server } }
        // tslint:disable-next-line:no-any
      ] as any))
      .then(() => {
        success(t("Received change of ownership."));
      });
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
            value={this.state.server}
            type="text" />
        </Col>
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
