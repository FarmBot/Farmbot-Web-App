import * as React from "react";
import axios from "axios";

import { error as log, init as logInit } from "farmbot-toastr";
import { prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../ui/index";
import { Session } from "../session";
import { t } from "../i18next_wrapper";

export interface State {
  password?: string;
  passwordConfirmation?: string;
  serverURL?: string;
  serverPort?: string;
}

export interface Props { }

export class PasswordReset extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      password: "",
      passwordConfirmation: "",
      serverURL: "",
      serverPort: ""
    };
  }

  componentDidMount() {
    logInit();
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({
      serverURL: API.fetchHostName(),
      serverPort: API.inferPort()
    });
  }

  set = (name: string) => (event: React.FormEvent<HTMLInputElement>) => {
    const state: { [name: string]: string } = {};
    state[name] = (event.currentTarget).value;
    this.setState(state);
  };

  submit(e: React.SyntheticEvent<HTMLInputElement>) {
    e.preventDefault();
    const { password, passwordConfirmation } = this.state;
    const token = window.location.href.split("/").pop();
    axios.put(API.current.passwordResetPath, {
      id: token,
      password,
      password_confirmation: passwordConfirmation,
    })
      .then(Session.clear)
      .catch((error: string) => {
        log(prettyPrintApiErrors(error as {}));
      });
  }

  render() {

    const buttonStylesUniqueToOnlyThisPage = {
      marginTop: "1rem",
      padding: ".5rem 1.6rem",
      fontSize: "1.2rem",
      borderBottom: "none"
    };

    return <div className="static-page">
      <div className="all-content-wrapper">
        <h1 className="text-center">
          {t("Reset your password")}
        </h1>
        <br />
        <Row>
          <Col xs={12} sm={6} className="col-sm-push-3">
            <Widget>
              <WidgetHeader title={"Reset Password"} />
              <WidgetBody>
                <form onSubmit={this.submit.bind(this)}>
                  <label>
                    {t("New Password")}
                  </label>
                  <input
                    type="password"
                    onChange={this.set("password").bind(this)} />
                  <label>
                    {t("Confirm New Password")}
                  </label>
                  <input
                    type="password"
                    onChange={this.set("passwordConfirmation").bind(this)} />
                  <Row>
                    <Col xs={12}>
                      <button
                        className="fb-button green pull-right"
                        style={buttonStylesUniqueToOnlyThisPage}>
                        {t("Reset")}
                      </button>
                    </Col>
                  </Row>
                </form>
              </WidgetBody>
            </Widget>
          </Col>
        </Row>
      </div>
    </div>;
  }
}
