import * as React from "react";
import axios from "axios";

import { fun as log, error as logError, init as logInit } from "farmbot-toastr";
import { AuthState } from "../auth/interfaces";
import { Session } from "../session";
import { prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Row, Col, Widget, WidgetHeader, WidgetBody } from "../ui";
import { TermsCheckbox } from "../front_page/terms_checkbox";
import { t } from "../i18next_wrapper";

interface Props { }
interface State {
  email: string;
  password: string;
  agree_to_terms: boolean;
}

export class TosUpdate extends React.Component<Props, Partial<State>> {
  constructor(props: Props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = { agree_to_terms: false };
  }

  set = (name: keyof State) => (event: React.FormEvent<HTMLInputElement>) => {
    const state: { [name: string]: State[keyof State] } = {};
    state[name] = (event.currentTarget).value;
    this.setState(state);
  };

  submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email, password, agree_to_terms } = this.state;
    const payload = { user: { email, password, agree_to_terms } };
    API.setBaseUrl(API.fetchBrowserLocation());
    axios
      .post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.replaceToken(resp.data);
        window.location.assign("/app/controls");
      })
      .catch(error => {
        logError(prettyPrintApiErrors(error));
      });
  }

  get tosLoadOk() { return (globalConfig.TOS_URL && globalConfig.PRIV_URL); }

  tosForm() {
    if (this.tosLoadOk) {
      const agree = this.state.agree_to_terms;
      return <form onSubmit={this.submit}>
        <div className="input-group">
          <label> {t("Email")} </label>
          <input type="email"
            onChange={this.set("email").bind(this)}>
          </input>
          <label>{t("Password")}</label>
          <input type="password"
            onChange={this.set("password").bind(this)}>
          </input>
          <TermsCheckbox
            privUrl={globalConfig.PRIV_URL}
            tosUrl={globalConfig.TOS_URL}
            onChange={e =>
              this.setState({ agree_to_terms: e.currentTarget.checked })}
            agree={agree} />
          <Row>
            <Col xs={12}>
              <button
                className="green fb-button"
                onClick={() =>
                  !agree && logError(t("Please agree to the terms."))}
                type={agree ? "submit" : "button"}>
                {t("I Agree to the Terms of Service")}
              </button>
            </Col>
          </Row>
        </div>
      </form>;
    } else {
      return <div>
        <p>
          {t("Something went wrong while rendering this page.")}
        </p>
        <p>
          {t("Please send us an email at contact@farm.bot or see the ")}
          <a href="http://forum.farmbot.org/">
            {t("FarmBot forum.")}
          </a>
        </p>
      </div>;
    }
  }

  componentDidMount() {
    logInit();
    const body = t("Before logging in, you must agree to our latest Terms" +
      " of Service and Privacy Policy");
    log(body, t("New Terms of Service"));
  }

  render() {
    return <div className="static-page">
      <div className="all-content-wrapper">
        <Widget>
          <WidgetHeader title={
            this.tosLoadOk
              ? t("Agree to Terms of Service")
              : t("Problem Loading Terms of Service")} />
          <WidgetBody>
            {this.tosForm()}
          </WidgetBody>
        </Widget>
      </div>
    </div>;
  }
}
