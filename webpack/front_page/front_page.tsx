import * as React from "react";
import axios from "axios";
import { t } from "i18next";
import * as _ from "lodash";
import { error as log, success, init as logInit } from "farmbot-toastr";
import { AuthState } from "../auth/interfaces";
import { prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Session } from "../session";
import { FrontPageState } from "./interfaces";
import { Row, Col } from "../ui/index";
import { LoginProps, Login } from "./login";
import { ForgotPassword, ForgotPasswordProps } from "./forgot_password";
import { ResendVerification } from "./resend_verification";
import { CreateAccount } from "./create_account";

export class FrontPage extends React.Component<{}, Partial<FrontPageState>> {
  constructor(props: {}) {
    super(props);
    this.state = {
      registrationSent: false,
      regEmail: "",
      regName: "",
      regPassword: "",
      regConfirmation: "",
      email: "",
      loginPassword: "",
      showServerOpts: false,
      serverURL: "",
      serverPort: "",
      agreeToTerms: false,
      activePanel: "login"
    };
    this.toggleServerOpts = this.toggleServerOpts;
  }

  componentDidMount() {
    if (Session.fetchStoredToken()) { window.location.href = "/app/controls"; }
    logInit();
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({
      serverURL: API.fetchHostName(),
      serverPort: API.inferPort()
    });
  }

  set = (name: keyof FrontPageState) =>
    (event: React.FormEvent<HTMLInputElement>) => {
      const state: { [name: string]: string } = {};
      event.currentTarget.checked;
      const isChk = (event.currentTarget.type === "checkbox");
      state[name] = "" + (event.currentTarget)[isChk ? "checked" : "value"];

      // WHY THE 2 ms timeout you ask????
      // There was a bug reported in Firefox.
      // I have no idea why, but the checkbox would uncheck itself after being
      // checked. Some sort of race condtion. ¯\_(ツ)_/¯
      setTimeout(() => this.setState(state), 2);
    };

  submitLogin = (e: React.FormEvent<{}>) => {
    e.preventDefault();
    const { email, loginPassword, showServerOpts } = this.state;
    const payload = { user: { email, password: loginPassword } };
    let url: string;
    if (showServerOpts) {
      url = `//${this.state.serverURL}:${this.state.serverPort}`;
    } else {
      url = API.fetchBrowserLocation();
    }
    API.setBaseUrl(url);
    axios.post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.replaceToken(resp.data);
        window.location.href = "/app/controls";
      }).catch((error: Error) => {
        switch (_.get(error, "response.status")) {
          case 451: // TOS was updated; User must agree to terms.
            window.location.href = "/tos_update";
            break;
          case 403: // User did not click verification email link.
            log(t("Account Not Verified"));
            this.setState({ activePanel: "resendVerificationEmail" });
            break;
          default:
            log(prettyPrintApiErrors(error as {}));
        }
      });
  }

  submitRegistration = (e: React.FormEvent<{}>) => {
    e.preventDefault();
    const {
      regEmail,
      regName,
      regPassword,
      regConfirmation,
      agreeToTerms
    } = this.state;

    const form = {
      user: {
        name: regName,
        email: regEmail,
        password: regPassword,
        password_confirmation: regConfirmation,
        agree_to_terms: agreeToTerms
      }
    };
    axios.post(API.current.usersPath, form).then(() => {
      const m = "Almost done! Check your email for the verification link.";
      success(t(m));
      this.setState({ registrationSent: true });
    }).catch(error => {
      log(prettyPrintApiErrors(error));
    });
  }

  toggleServerOpts = () => {
    this.setState({ showServerOpts: !this.state.showServerOpts });
  }

  toggleForgotPassword = () => this.setState({ activePanel: "forgotPassword" });

  submitForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email } = this.state;
    const data = { email };
    axios.post(API.current.passwordResetPath, data)
      .then(() => {
        success(t("Email has been sent."), t("Forgot Password"));
        this.setState({ activePanel: "login" });
      }).catch(error => {
        let errorMessage = prettyPrintApiErrors(error);
        if (errorMessage.toLowerCase().includes("not found")) {
          errorMessage =
            `That email address is not associated with an account.`;
        }
        log(t(errorMessage));
      });
  }

  maybeRenderTos = () => {
    const TOS_URL = globalConfig.TOS_URL;
    if (TOS_URL) {
      const PRV_URL = globalConfig.PRIV_URL;
      return <div>
        <div className={"tos"}>
          <label>{t("I agree to the terms of use")}</label>
          <input type="checkbox"
            onChange={this.set("agreeToTerms")}
            value={this.state.agreeToTerms ? "false" : "true"} />
        </div>
        <ul>
          <li>
            <a
              href={PRV_URL}
              target="_blank">
              {t("Privacy Policy")}
            </a>
          </li>
          <li>
            <a
              href={TOS_URL}
              target="_blank">
              {t("Terms of Use")}
            </a>
          </li>
        </ul>
      </div>;
    }
  }

  loginPanel = () => {
    const props: LoginProps = {
      email: this.state.email || "",
      onEmailChange: this.set("email"),
      loginPassword: this.state.loginPassword || "",
      onLoginPasswordChange: this.set("loginPassword"),
      serverURL: this.state.serverURL || "",
      onServerURLChange: this.set("serverURL"),
      serverPort: this.state.serverPort || "",
      onServerPortChange: this.set("serverPort"),
      showServerOpts: !!this.state.showServerOpts,
      onToggleServerOpts: this.toggleServerOpts,
      onToggleForgotPassword: this.toggleForgotPassword,
      onSubmit: this.submitLogin,
    };
    return <Login {...props} />;
  }

  forgotPasswordPanel = () => {
    const goBack = () => this.setState({ activePanel: "login" });
    const props: ForgotPasswordProps = {
      onGoBack: goBack,
      onSubmit: this.submitForgotPassword,
      email: this.state.email || "",
      onEmailChange: this.set("email"),
    };
    return <ForgotPassword {...props} />;
  }

  resendVerificationPanel = () => {
    const goBack = () => this.setState({ activePanel: "login" });
    return <ResendVerification
      onGoBack={goBack}
      ok={(resp) => {
        success(t("Verification email resent. Please check your email!"));
        goBack();
      }}
      no={() => {
        log(t("Unable to resend verification email. " +
          "Are you already verified?"));
        goBack();
      }}
      email={this.state.email || ""} />;
  }

  activePanel = () => {
    switch (this.state.activePanel) {
      case "forgotPassword": return this.forgotPasswordPanel();
      case "resendVerificationEmail": return this.resendVerificationPanel();
      case "login":
      default:
        return this.loginPanel();
    }
  }

  defaultContent() {
    return <div className="static-page">
      <Row>
        <Col xs={12}>
          <h1 className="text-center">
            {t("Welcome to the")}
            <br className="hidden-sm hidden-md hidden-lg hidden-xl" />
            &nbsp;
              {t("FarmBot Web App")}
          </h1>
        </Col>
      </Row>

      <div className="inner-width">
        <Row>
          <h2 className="text-center">
            <Col xs={12}>
              {t("Setup, customize, and control FarmBot from your")}
              &nbsp;
              <span className="hidden-xs hidden-sm">
                {t("computer")}
              </span>
              <span className="hidden-xs hidden-md hidden-lg hidden-xl">
                {t("tablet")}
              </span>
              <span className="hidden-sm hidden-md hidden-lg hidden-xl">
                {t("smartphone")}
              </span>
            </Col>
          </h2>
        </Row>
        <img
          className="hidden-xs hidden-sm col-md-7"
          src="/app-resources/img/farmbot-desktop.png" />
        <img
          className="hidden-xs hidden-md hidden-lg hidden-xl col-sm-7"
          src="/app-resources/img/farmbot-tablet.png" />
        <Row>
          <this.activePanel />
          <CreateAccount
            submitRegistration={this.submitRegistration}
            sent={!!this.state.registrationSent}
            get={(key) => this.state[key]}
            set={(key, val) => this.setState({ [key]: val })}>
            {this.maybeRenderTos()}
          </CreateAccount>
        </Row>
      </div>
    </div>;
  }

  render() { return Session.fetchStoredToken() ? <div /> : this.defaultContent(); }
}
