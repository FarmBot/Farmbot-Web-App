import * as React from "react";
import axios from "axios";
import { error as log, success, init as logInit } from "../toast/toast";
import { AuthState } from "../auth/interfaces";
import { prettyPrintApiErrors, attachToRoot } from "../util";
import { API } from "../api";
import { Session } from "../session";
import { FrontPageState, SetterCB } from "./interfaces";
import { Row, Col } from "../ui/index";
import { LoginProps, Login } from "./login";
import { ForgotPassword, ForgotPasswordProps } from "./forgot_password";
import { ResendVerification } from "./resend_verification";
import { CreateAccount } from "./create_account";
import { Content } from "../constants";
import { LaptopSplash } from "./laptop_splash";
import { TermsCheckbox } from "./terms_checkbox";
import { get } from "lodash";
import { t } from "../i18next_wrapper";

export const attachFrontPage =
  () => attachToRoot(FrontPage, {});

const showFor = (size: string[], extraClass?: string): string => {
  const ALL_SIZES = ["xs", "sm", "md", "lg", "xl"];
  const HIDDEN_SIZES = ALL_SIZES.filter(x => !size.includes(x));
  const classNames = HIDDEN_SIZES.map(x => "hidden-" + x);
  if (extraClass) { classNames.push(extraClass); }
  return classNames.join(" ");
};

export interface PartialFormEvent {
  currentTarget: {
    checked: boolean;
    defaultValue: string;
    value: string;
  }
}

/** Set value for front page state field (except for "activePanel"). */
export const setField =
  (field: keyof Omit<FrontPageState, "activePanel">, cb: SetterCB) =>
    (event: PartialFormEvent) => {
      const state: Partial<FrontPageState> = {};

      switch (field) {
        // Booleans
        case "agreeToTerms":
        case "registrationSent":
          state[field] = event.currentTarget.checked;
          break;
        // all others (string)
        default:
          state[field] = event.currentTarget.value;
      }
      cb(state);
    };

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
      agreeToTerms: false,
      activePanel: "login"
    };
  }

  componentDidMount() {
    if (Session.fetchStoredToken()) { window.location.assign("/app/controls"); }
    logInit();
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({});
  }

  submitLogin = (e: React.FormEvent<{}>) => {
    e.preventDefault();
    const { email, loginPassword } = this.state;
    const payload = { user: { email, password: loginPassword } };
    API.setBaseUrl(API.fetchBrowserLocation());
    axios.post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.replaceToken(resp.data);
        window.location.assign("/app/controls");
      }).catch((error: Error) => {
        switch (get(error, "response.status")) {
          case 451: // TOS was updated; User must agree to terms.
            window.location.assign("/tos_update");
            break;
          case 403: // User did not click verification email link.
            log(t("Account Not Verified"));
            this.setState({ activePanel: "resendVerificationEmail" });
            break;
          default:
            log(prettyPrintApiErrors(error as {}));
        }
        this.setState({ loginPassword: "" });
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

  handleFormUpdate: SetterCB = (state) => this.setState(state);

  maybeRenderTos = () => {
    if (globalConfig.TOS_URL) {
      return <TermsCheckbox
        privUrl={globalConfig.PRIV_URL}
        tosUrl={globalConfig.TOS_URL}
        onChange={setField("agreeToTerms", this.handleFormUpdate)}
        agree={this.state.agreeToTerms} />;
    }
  }

  loginPanel = () => {
    const props: LoginProps = {
      email: this.state.email || "",
      onEmailChange: setField("email", this.handleFormUpdate),
      onLoginPasswordChange: setField("loginPassword", this.handleFormUpdate),
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
      onEmailChange: setField("email", this.handleFormUpdate),
    };
    return <ForgotPassword {...props} />;
  }

  resendVerificationPanel = () => {
    const goBack = () => this.setState({ activePanel: "login" });
    return <ResendVerification
      onGoBack={goBack}
      ok={() => {
        success(t(Content.VERIFICATION_EMAIL_RESENT));
        goBack();
      }}
      no={() => {
        log(t(Content.VERIFICATION_EMAIL_RESEND_ERROR));
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
            <br className={showFor(["xs"])} />
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
              <span className={showFor(["md", "lg", "xl"])}>
                {t("computer")}
              </span>
              <span className={showFor(["sm"])}>
                {t("tablet")}
              </span>
              <span className={showFor(["xs"])}>
                {t("smartphone")}
              </span>
            </Col>
          </h2>
        </Row>
        <LaptopSplash className={showFor(["md", "lg", "xl"], "col-md-7")} />
        <img
          className={showFor(["sm"], "col-md-7")}
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

  render() {
    return Session.fetchStoredToken()
      ? <div className={"app-loading"} />
      : this.defaultContent();
  }
}
