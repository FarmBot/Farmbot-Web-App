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
import { BlurablePassword } from "../ui/blurable_password";

export interface LoginProps {
  /** Attributes */
  email: string | undefined;
  /** Callbacks */
  onToggleForgotPassword(): void;
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  onEmailChange(e: React.SyntheticEvent<HTMLInputElement>): void;
  onLoginPasswordChange(e: React.SyntheticEvent<HTMLInputElement>): void;
}

export class Login extends React.Component<LoginProps, {}> {
  /** PROBLEM: <BlurableInput /> only updates when when `blur` event happens.
   *           * No update when you push return key- that's a submit event.
   * SOLUTION: Intercept the `submit` event and forcibly focus on a hidden
   *           input control, thereby triggering the blur event across all
   *           fields.
   */
  private hiddenFieldRef: HTMLElement | undefined = undefined;

  /** CSS to hide the fake input field used to change focus. */
  HIDE_ME = { background: "transparent", border: "none", display: "node" };

  render() {
    const {
      email,
      onEmailChange,
      onSubmit,
      onLoginPasswordChange,
      onToggleForgotPassword,
    } = this.props;
    return <Col xs={12} sm={5} smOffset={1} mdOffset={0}>
      <Widget>
        <WidgetHeader title={"Login"} />
        <WidgetBody>
          <form onSubmit={(e) => {
            e.persist();
            e.preventDefault();
            /** Force focus on fake input. Triggers blur on all inputs. */
            this.hiddenFieldRef && this.hiddenFieldRef.focus();
            /** Give React time to update stuff before triggering callback. */
            setTimeout(() => onSubmit(e), 3);
          }}>
            <div style={{ width: 1, height: 1, overflow: "hidden" }}>
              <input type="text"
                style={this.HIDE_ME}
                ref={(x) => x && (this.hiddenFieldRef = x)} />
            </div>
            <label>
              {t("Email")}
            </label>
            <BlurableInput
              type="email"
              value={email || ""}
              name="login_email"
              onCommit={onEmailChange} />
            <label>
              {t("Password")}
            </label>
            <BlurablePassword
              name="login_password"
              onCommit={onLoginPasswordChange} />
            <a className="forgot-password" onClick={onToggleForgotPassword} >
              {t("Forgot password?")}
            </a>
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
}
