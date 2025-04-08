import React from "react";
import { WidgetBody } from "../ui";
import { t } from "../i18next_wrapper";

export function ResendPanelBody(props: { onClick(): void; }) {
  return <WidgetBody>
    <div className={"grid"}>
      <p>
        {t("Please check your email for the verification link.")}
      </p>
      <p>
        {t("You may click the button below to resend the email.")}
      </p>
      <button onClick={props.onClick}
        type="button"
        title={t("Resend Verification Email")}
        className="fb-button green pull-right front-page-button">
        {t("Resend Verification Email")}
      </button>
    </div>
  </WidgetBody>;
}
