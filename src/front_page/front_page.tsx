import * as React from "react";
import * as axios from "axios";
import { t } from "i18next";
import { error as log, success, init as logInit } from "farmbot-toastr";
import { AuthState } from "../auth/interfaces";
import { prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Session } from "../session";
import { FrontPageState } from "./interfaces";

export class FrontPage extends React.Component<{}, Partial<FrontPageState>> {
  constructor() {
    super();
    this.state = {
      regEmail: "",
      regName: "",
      regPassword: "",
      regConfirmation: "",
      email: "",
      loginPassword: "",
      showServerOpts: false,
      serverURL: "",
      serverPort: "",
      forgotPassword: false,
      agreeToTerms: false
    };
    this.toggleServerOpts = this.toggleServerOpts.bind(this);
  }

  componentDidMount() {
    logInit();
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({
      serverURL: API.fetchHostName(),
      serverPort: API.inferPort()
    });
  }

  set = (name: keyof FrontPageState) =>
    (event: React.FormEvent<HTMLInputElement>) => {
      let state: { [name: string]: string } = {};
      state[name] = (event.currentTarget).value;
      // WHY THE 2 ms timeout you ask????
      // There was a bug reported in Firefox.
      // I have no idea why, but the checkbox would uncheck itself after being
      // checked. Some sort of race condtion. ¯\_(ツ)_/¯
      setTimeout(() => this.setState(state), 2);
    };

  submitLogin(e: React.FormEvent<{}>) {
    e.preventDefault();
    let { email, loginPassword, showServerOpts } = this.state;
    let payload = { user: { email, password: loginPassword } };
    let url: string;
    if (showServerOpts) {
      url = `//${this.state.serverURL}:${this.state.serverPort}`;
    } else {
      url = API.fetchBrowserLocation();
    }
    API.setBaseUrl(url);
    axios.post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.put(resp.data);
        window.location.href = "/app/controls";
      }).catch(error => {
        if (_.get(error, "response.status") === 451) {
          window.location.href = "/tos_update.html";
        }
        log(prettyPrintApiErrors(error));
      });
  }

  submitRegistration(e: React.FormEvent<{}>) {
    e.preventDefault();
    let { regEmail, regName, regPassword, regConfirmation, agreeToTerms } = this.state;
    let form = {
      user: {
        name: regName,
        email: regEmail,
        password: regPassword,
        password_confirmation: regConfirmation,
        agree_to_terms: agreeToTerms
      }
    };
    axios.post<AuthState>(API.current.usersPath, form).then(resp => {
      let m = "Almost done! Check your email for the verification link.";
      success(t(m));
    }).catch(error => {
      log(prettyPrintApiErrors(error));
    });
  }

  toggleServerOpts() {
    this.setState({ showServerOpts: !this.state.showServerOpts });
  }

  toggleForgotPassword() {
    this.setState({ forgotPassword: !this.state.forgotPassword });
  }

  submitForgotPassword(e: React.SyntheticEvent<HTMLInputElement>) {
    e.preventDefault();
    let { email } = this.state;
    let data = { email };
    axios.post<{}>(API.current.passwordResetPath, data)
      .then(resp => {
        success("Email has been sent.", "Forgot Password");
        this.setState({ forgotPassword: false });
      }).catch(error => {
        log(prettyPrintApiErrors(error));
      });
  }

  maybeRenderTos() {
    const TOS_URL = process.env.TOS_URL;
    if (TOS_URL) {
      const PRV_URL = process.env.PRIV_URL;
      return <div>
        <div>
          <label>{t("I agree to the terms of use")}</label>
          <input type="checkbox"
            onChange={this.set("agreeToTerms").bind(this)}
            value={this.state.agreeToTerms ? "false" : "true"} />
        </div>
        <ul>
          <li><a href={PRV_URL}>{t("Privacy Policy")}</a></li>
          <li><a href={TOS_URL}>{t("Terms of Use")}</a></li>
        </ul>
      </div>;
    }
  }

  render() {
    let buttonStylesUniqueToOnlyThisPage = {
      marginTop: "1.5rem",
      padding: ".5rem 1.6rem",
      fontSize: "1.2rem",
      borderBottom: "none"
    };

    let { showServerOpts, forgotPassword } = this.state;
    let expandIcon = showServerOpts ? "minus" : "plus";
    let { toggleServerOpts } = this;
    return (
      <div className="static-page">
        <h1>
          {t("Welcome to the FarmBot Web App")}
        </h1>
        <h2 className="fb-desktop-show">
          {t("Setup, customize, and control FarmBot from your computer")}
        </h2>
        <h2 className="fb-tablet-show">
          {t("Setup, customize, and control FarmBot from your tablet")}
        </h2>
        <h2 className="fb-mobile-show">
          {t("Setup, customize, and control FarmBot from your smartphone")}
        </h2>
        <div className="image-login-wrapper">
          <div className="image-wrapper">
            <img className="fb-desktop-show"
              src="/app-resources/img/farmbot-desktop.png" />
            <img className="fb-tablet-show"
              src="/app-resources/img/farmbot-tablet.png" />
          </div>
          <div className="all-content-wrapper login-wrapper">
            {!forgotPassword && (
              <div className="row">
                <div className="widget-wrapper">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="widget-header">
                        <h5>{t("Login")}</h5>
                        <i className={`fa fa-${expandIcon}`}
                          onClick={toggleServerOpts}>
                        </i>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <form onSubmit={this.submitLogin.bind(this)}>
                      <div className="col-sm-12">
                        <div className="widget-content">
                          <div className="input-group">
                            <label>{t("Email")}</label>
                            <input type="email"
                              onChange={this.set("email").bind(this)}>
                            </input>
                            <label>{t("Password")}</label>
                            <input type="password"
                              onChange={this.set("loginPassword").bind(this)}>
                            </input>
                            <a
                              className="forgot-password"
                              onClick={this.toggleForgotPassword.bind(this)}>
                              {t("Forgot password?")}
                            </a>
                            {this.state.showServerOpts && (
                              <div>
                                <label>{t("Server URL")}</label>
                                <input type="text"
                                  onChange={this.set("serverURL").bind(this)}
                                  value={this.state.serverURL}>
                                </input>
                                <label>{t("Server Port")}</label>
                                <input type="text"
                                  onChange={this.set("serverPort").bind(this)}
                                  value={this.state.serverPort}>
                                </input>
                              </div>
                            )}
                          </div>
                          <div className="row">
                            <div className="col-xs-12">
                              <button
                                className="fb-button green"
                                style={buttonStylesUniqueToOnlyThisPage}
                              >
                                {t("Login")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {forgotPassword && (
              <div className="row">
                <div className="widget-wrapper">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="widget-header">
                        <h5>{t("Forgot Password")}</h5>
                        <button
                          className="fb-button gray"
                          onClick={this.toggleForgotPassword.bind(this)}
                        >
                          {t("BACK")}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <form onSubmit={this.submitForgotPassword.bind(this)}>
                      <div className="col-sm-12">
                        <div className="widget-content">
                          <div className="input-group">
                            <label>{t("Enter Email")}</label>
                            <input type="email"
                              onChange={this.set("email").bind(this)}>
                            </input>
                          </div>
                          <div className="row">
                            <div className="col-xs-12">
                              <button
                                className="fb-button green"
                                style={buttonStylesUniqueToOnlyThisPage}
                              >
                                {t("Send Password reset")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
            <div className="row">
              <div className="widget-wrapper">
                <div className="row">
                  <div className="col-sm-12">
                    <div className="widget-header">
                      <h5> {t("Create An Account")} </h5>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-12">
                    <form onSubmit={this.submitRegistration.bind(this)} >
                      <div className="widget-content">
                        <div className="input-group">
                          <label>{t("Email")} </label>
                          <input type="email" onChange={this.set("regEmail").bind(this)} ></input>
                          <label>{t("Name")}</label>
                          <input type="text" onChange={this.set("regName").bind(this)}></input>
                          <label>{t("Password")}</label>
                          <input type="password"
                            onChange={this.set("regPassword").bind(this)}>
                          </input>
                          <label>{t("Verify Password")}</label>
                          <input type="password"
                            onChange={
                              this.set("regConfirmation").bind(this)}>
                          </input>
                          {this.maybeRenderTos()}
                        </div>
                        <div className="row">
                          <div className="col-xs-12">
                            <button
                              className="fb-button green"
                              style={buttonStylesUniqueToOnlyThisPage}
                            >
                              {t("Create Account")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

