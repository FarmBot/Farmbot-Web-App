import React from "react";
import { t } from "../i18next_wrapper";
import { Widget, WidgetBody, WidgetHeader } from "../ui";
import { updatePageInfo } from "../util";

export interface LoginProps {
  email: string | undefined;
  onToggleForgotPassword(): void;
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  onEmailChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  onLoginPasswordChange(e: React.SyntheticEvent<HTMLInputElement>): void;
}

export class Login extends React.Component<LoginProps, {}> {
  render() {
    const {
      email,
      onEmailChange,
      onSubmit,
      onLoginPasswordChange,
      onToggleForgotPassword,
    } = this.props;
    updatePageInfo("login");
    return <Widget>
      <WidgetHeader title={"Login"} />
      <WidgetBody>
        <form onSubmit={onSubmit}>
          <div>
            <label>
              {t("Email")}
            </label>
            <input
              type={"email"}
              name={"email"}
              value={email || ""}
              autoFocus={true}
              onChange={onEmailChange} />
          </div>
          <div>
            <label>
              {t("Password")}
            </label>
            <input
              type={"password"}
              name={"password"}
              onChange={onLoginPasswordChange} />
          </div>
          <div className="forgot-password-login-row">
            <a className="forgot-password"
              title={t("Forgot password?")}
              onClick={onToggleForgotPassword}>
              {t("Forgot password?")}
            </a>
            <button className="fb-button green pull-right front-page-button"
              title={t("Login")}>
              {t("Login")}
            </button>
          </div>
        </form>
      </WidgetBody>
    </Widget>;
  }
}
