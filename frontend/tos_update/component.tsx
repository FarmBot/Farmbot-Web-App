import React from "react";
import axios from "axios";
import { fun as log, error as logError } from "../toast/toast";
import { AuthState } from "../auth/interfaces";
import { Session } from "../session";
import { AxiosErrorResponse, prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Widget, WidgetHeader, WidgetBody } from "../ui";
import { TermsCheckbox } from "../front_page/terms_checkbox";
import { t } from "../i18next_wrapper";
import { ExternalUrl } from "../external_urls";
import { DEFAULT_APP_PAGE } from "../front_page/front_page";
import { ToastContainer } from "../toast/fb_toast";

interface State {
  email: string;
  password: string;
  agree_to_terms: boolean;
}

export class TosUpdate extends React.Component<{}, Partial<State>> {
  constructor(props: {}) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = { agree_to_terms: false };
  }

  update = () => setTimeout(() => this.forceUpdate(), 100);

  set = (key: keyof State) => (event: React.FormEvent<HTMLInputElement>) => {
    const state: { [key: string]: State[keyof State] } = {};
    state[key] = (event.currentTarget).value;
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
        window.location.assign(DEFAULT_APP_PAGE);
      })
      .catch((error: AxiosErrorResponse) => {
        logError(prettyPrintApiErrors(error));
        this.update();
      });
  }

  get tosLoadOk() { return (globalConfig.TOS_URL && globalConfig.PRIV_URL); }

  tosForm() {
    if (this.tosLoadOk) {
      const agree = this.state.agree_to_terms;
      return <form onSubmit={this.submit}>
        <div className="input-group grid">
          <div>
            <label> {t("Email")} </label>
            <input type="email" name="email"
              onChange={this.set("email").bind(this)}>
            </input>
          </div>
          <div>
            <label>{t("Password")}</label>
            <input type={"password"}
              onChange={this.set("password").bind(this)}>
            </input>
          </div>
          <TermsCheckbox
            privUrl={globalConfig.PRIV_URL}
            tosUrl={globalConfig.TOS_URL}
            onChange={e =>
              this.setState({ agree_to_terms: e.currentTarget.checked })}
            agree={agree} />
          <button
            className="green fb-button pull-right"
            title={t("agree")}
            onClick={() => {
              !agree && logError(t("Please agree to the terms."));
              this.update();
            }}
            type={agree ? "submit" : "button"}>
            {t("I Agree to the Terms of Service")}
          </button>
        </div>
      </form>;
    } else {
      return <div className={"something-went-wrong"}>
        <p>
          {t("Something went wrong while rendering this page.")}
        </p>
        <p>
          {t("Please send us an email at contact@farm.bot or see the ")}
          <a href={ExternalUrl.softwareForum}>
            {t("FarmBot forum.")}
          </a>
        </p>
      </div>;
    }
  }

  componentDidMount() {
    const body = t("Before logging in, you must agree to our latest Terms" +
      " of Service and Privacy Policy");
    log(body, { title: t("New Terms of Service") });
    this.update();
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
      <ToastContainer />
    </div>;
  }
}
