import * as React from "react";
import {
  BlurableInput,
  Col,
  Widget,
  WidgetBody,
  WidgetHeader,
  Row,
} from "../ui/index";
import { t } from "i18next";

export interface LoginProps {
  /** Attributes */
  email: string | undefined;
  loginPassword: string | undefined;
  serverURL: string | undefined;
  serverPort: string | undefined;

  /** Flags */
  showServerOpts: boolean;

  /** Callbacks */
  onToggleForgotPassword(): void;
  onToggleServerOpts(e: React.MouseEvent<HTMLButtonElement>): void;
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  onEmailChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  onLoginPasswordChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  onServerURLChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  onServerPortChange(e: React.SyntheticEvent<HTMLInputElement>): void;
}

export function Login(props: LoginProps) {
  const {
    email,
    loginPassword,
    onEmailChange,
    onSubmit,
    onLoginPasswordChange,
    onServerPortChange,
    onServerURLChange,
    serverPort,
    serverURL,
    showServerOpts,
    onToggleForgotPassword,
    onToggleServerOpts,
  } = props;
  const expandIcon = showServerOpts ? "minus" : "plus";
  return <Col xs={12} sm={5}>
    <Widget>
      <WidgetHeader title={"Login"}>
        <button
          className="fb-button gray"
          onClick={onToggleServerOpts} >
          <i className={`fa fa-${expandIcon}`} />
        </button>
      </WidgetHeader>
      <WidgetBody>
        <form onSubmit={onSubmit}>
          <label>
            {t("Email")}
          </label>
          <BlurableInput
            type="email"
            value={email || ""}
            onCommit={onEmailChange} />
          <label>
            {t("Password")}
          </label>
          <BlurableInput
            type="password"
            value={loginPassword || ""}
            onCommit={onLoginPasswordChange} />
          <a className="forgot-password" onClick={onToggleForgotPassword} >
            {t("Forgot password?")}
          </a>
          {showServerOpts &&
            <div>
              <label>
                {t("Server URL")}
              </label>
              <BlurableInput
                type="text"
                onCommit={onServerURLChange}
                value={serverURL || ""} />
              <label>
                {t("Server Port")}
              </label>
              <BlurableInput
                type="text"
                onCommit={onServerPortChange}
                value={serverPort || ""} />
            </div>
          }
          <Row>
            <button className="fb-button green pull-right front-page-button">
              {t("Login")}
            </button>
          </Row>
        </form>
      </WidgetBody>
    </Widget>
  </Col>;
}
