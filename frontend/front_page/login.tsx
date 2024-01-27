import React from "react";
import { t } from "../i18next_wrapper";
import { Col, Widget, WidgetBody, WidgetHeader, Row } from "../ui";
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
    return <Col xs={12} sm={5} smOffset={1} mdOffset={0}>
      <Widget>
        <WidgetHeader title={"Login"} />
        <WidgetBody>
          <form onSubmit={onSubmit}>
            <label>
              {t("Email")}
            </label>
            <input
              type={"email"}
              name={"email"}
              value={email || ""}
              autoFocus={true}
              onChange={onEmailChange} />
            <label>
              {t("Password")}
            </label>
            <input
              type={"password"}
              name={"password"}
              onChange={onLoginPasswordChange} />
            <a className="forgot-password"
              title={t("Forgot password?")}
              onClick={onToggleForgotPassword}>
              {t("Forgot password?")}
            </a>
            <Row>
              <button className="fb-button green pull-right front-page-button"
                title={t("Login")}>
                {t("Login")}
              </button>
            </Row>
          </form>
        </WidgetBody>
      </Widget>
    </Col>;
  }
}
