import React from "react";
import axios from "axios";
import { error as log } from "../toast/toast";
import { prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Widget, WidgetHeader, WidgetBody, Row, Col } from "../ui";
import { Session } from "../session";
import { t } from "../i18next_wrapper";
import { ToastContainer } from "../toast/fb_toast";
import { get } from "lodash";

export interface State {
  password?: string;
  passwordConfirmation?: string;
  serverURL?: string;
  serverPort?: string;
}

export class PasswordReset extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      password: "",
      passwordConfirmation: "",
      serverURL: "",
      serverPort: ""
    };
  }

  update = () => setTimeout(() => this.forceUpdate(), 100);

  componentDidMount() {
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

  submit(e: React.SyntheticEvent<HTMLFormElement>) {
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        switch (get(error, "response.status") as unknown) {
          case 451: // TOS was updated; User must agree to terms.
            window.location.assign("/tos_update");
            break;
          default:
            log(prettyPrintApiErrors(error as {}));
            this.update();
        }
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
              <WidgetHeader
                title={"Reset Password"}
                helpText={t("Password must be 8 or more characters.")} />
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
                        title={t("Reset password")}
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
      <ToastContainer />
    </div>;
  }
}
