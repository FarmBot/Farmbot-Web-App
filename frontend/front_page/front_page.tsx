import React from "react";
import axios from "axios";
import { error as log, success } from "../toast/toast";
import { AuthState } from "../auth/interfaces";
import { AxiosErrorResponse, prettyPrintApiErrors } from "../util";
import { API } from "../api";
import { Session } from "../session";
import { FrontPageState, SetterCB } from "./interfaces";
import { LoginProps, Login } from "./login";
import { ForgotPassword, ForgotPasswordProps } from "./forgot_password";
import { ResendVerification } from "./resend_verification";
import { CreateAccount } from "./create_account";
import { Content } from "../constants";
import { TermsCheckbox } from "./terms_checkbox";
import { get } from "lodash";
import { t } from "../i18next_wrapper";
import { ToastContainer } from "../toast/fb_toast";
import { Path } from "../internal_urls";

export const DEFAULT_APP_PAGE = Path.app();

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
      activePanel: "login",
    };
  }

  componentDidMount() {
    if (Session.fetchStoredToken()) { window.location.assign(DEFAULT_APP_PAGE); }
    API.setBaseUrl(API.fetchBrowserLocation());
    this.setState({});
  }

  update = () => setTimeout(() => this.forceUpdate(), 100);

  submitLogin = (e: React.FormEvent<{}>) => {
    e.preventDefault();
    const { email, loginPassword } = this.state;
    const payload = { user: { email, password: loginPassword } };
    API.setBaseUrl(API.fetchBrowserLocation());
    axios.post<AuthState>(API.current.tokensPath, payload)
      .then(resp => {
        Session.replaceToken(resp.data);
        window.location.assign(DEFAULT_APP_PAGE);
      }).catch((error: Error) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        switch (get(error, "response.status") as unknown) {
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
        this.update();
        this.setState({ loginPassword: "" });
      });
  };

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
      this.update();
      this.setState({ registrationSent: true });
    }).catch((error: AxiosErrorResponse) => {
      log(prettyPrintApiErrors(error));
      this.update();
    });
  };

  toggleForgotPassword = () => this.setState({ activePanel: "forgotPassword" });

  submitForgotPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email } = this.state;
    const data = { email };
    axios.post(API.current.passwordResetPath, data)
      .then(() => {
        success(t("Email has been sent."), { title: t("Forgot Password") });
        this.update();
        this.setState({ activePanel: "login" });
      }).catch((error: AxiosErrorResponse) => {
        let errorMessage = prettyPrintApiErrors(error);
        if (errorMessage.toLowerCase().includes("not found")) {
          errorMessage =
            "That email address is not associated with an account.";
        }
        log(t(errorMessage));
        this.update();
      });
  };

  handleFormUpdate: SetterCB = (state) => this.setState(state);

  maybeRenderTos = () => {
    if (globalConfig.TOS_URL) {
      return <TermsCheckbox
        privUrl={globalConfig.PRIV_URL}
        tosUrl={globalConfig.TOS_URL}
        onChange={setField("agreeToTerms", this.handleFormUpdate)}
        agree={this.state.agreeToTerms} />;
    }
  };

  loginPanel = () => {
    const props: LoginProps = {
      email: this.state.email || "",
      onEmailChange: setField("email", this.handleFormUpdate),
      onLoginPasswordChange: setField("loginPassword", this.handleFormUpdate),
      onToggleForgotPassword: this.toggleForgotPassword,
      onSubmit: this.submitLogin,
    };
    return <Login {...props} />;
  };

  forgotPasswordPanel = () => {
    const goBack = () => this.setState({ activePanel: "login" });
    const props: ForgotPasswordProps = {
      onGoBack: goBack,
      onSubmit: this.submitForgotPassword,
      email: this.state.email || "",
      onEmailChange: setField("email", this.handleFormUpdate),
    };
    return <ForgotPassword {...props} />;
  };

  resendVerificationPanel = () => {
    const goBack = () => this.setState({ activePanel: "login" });
    return <ResendVerification
      onGoBack={goBack}
      ok={() => {
        success(t(Content.VERIFICATION_EMAIL_RESENT));
        this.update();
        goBack();
      }}
      no={() => {
        log(t(Content.VERIFICATION_EMAIL_RESEND_ERROR));
        this.update();
        goBack();
      }}
      email={this.state.email || ""} />;
  };

  activePanel = () => {
    switch (this.state.activePanel) {
      case "forgotPassword": return this.forgotPasswordPanel();
      case "resendVerificationEmail": return this.resendVerificationPanel();
      case "login":
      default:
        return this.loginPanel();
    }
  };

  defaultContent() {
    return <div className="static-page">
      <div className="front-page-container">
        <div className="titles text-center">
          <h1>{t("The FarmBot Web App")}</h1>
          <h2>{t("Setup, customize, and control your garden from anywhere")}</h2>
        </div>
        <this.activePanel />
        <div className="or-divider">
          <hr />
          <span>{t("OR")}</span>
          <hr />
        </div>
        <CreateAccount
          submitRegistration={this.submitRegistration}
          callback={this.update}
          sent={!!this.state.registrationSent}
          get={(key) => this.state[key]}
          set={(key, val) => this.setState({ [key]: val })}>
          {this.maybeRenderTos()}
        </CreateAccount>
      </div>
      <ToastContainer />
    </div>;
  }

  render() {
    return Session.fetchStoredToken()
      ? <div className={"app-loading"} />
      : this.defaultContent();
  }
}
