import React from "react";
import {
  Widget, WidgetHeader, WidgetBody, BlurableInput,
} from "../ui";
import { t } from "../i18next_wrapper";

export interface ForgotPasswordProps {
  onGoBack(): void;
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  email: string;
  onEmailChange(e: React.SyntheticEvent<HTMLInputElement>): void;
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const {
    onGoBack,
    onSubmit,
    email,
    onEmailChange,
  } = props;

  return <Widget>
    <WidgetHeader title={"Reset Password"}>
      <button
        className="fb-button gray"
        title={t("go back")}
        onClick={onGoBack}>
        {t("BACK")}
      </button>
    </WidgetHeader>
    <WidgetBody>
      <form onSubmit={onSubmit}>
        <div>
          <label>{t("Enter Email")}</label>
          <BlurableInput
            type="email"
            value={email}
            onCommit={onEmailChange} />
        </div>
        <button
          title={t("Reset Password")}
          className="fb-button green reset-password-button">
          {t("Reset Password")}
        </button>
      </form>
    </WidgetBody>
  </Widget>;
}
