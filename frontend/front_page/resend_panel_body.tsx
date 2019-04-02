import * as React from "react";
import { WidgetBody, Row } from "../ui/index";
import { t } from "../i18next_wrapper";


export function ResendPanelBody(props: { onClick(): void; }) {
  return <WidgetBody>
    <form>
      <Row>
        <p>
          {t("Please check your email for the verification link.")}
        </p>
        <p>
          {t("You may click the button below to resend the email.")}
        </p>
      </Row>
      <Row>
        <button onClick={props.onClick}
          type="button"
          className="fb-button green pull-right front-page-button">
          {t("Resend Verification Email")}
        </button>
      </Row>
    </form>
  </WidgetBody>;
}
