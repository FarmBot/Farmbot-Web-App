import { Col, Widget, WidgetHeader, WidgetBody, Row } from "../ui/index";
import { t } from "i18next";
import axios, { AxiosResponse } from "axios";
import * as React from "react";
import { API } from "../api/index";
import { UnsafeError } from "../interfaces";

interface Props {
  email: string;
  /** Callback when resend succeeds */
  ok(resp: AxiosResponse): void;
  /** Callback when resend fails */
  no(error: UnsafeError): void;
  onGoBack(): void;
}

interface State {

}

export class ResendVerification extends React.Component<Props, State> {

  state: State = {};

  render() {
    return <Col xs={12} sm={5}>
      <Widget>
        <WidgetHeader title={t("Account Not Verified")}>
          <button onClick={this.props.onGoBack}
            type="button"
            className="fb-button gray pull-right front-page-button">
            {t("back")}
          </button>
        </WidgetHeader>
        <ResendPanelBody onClick={() => resendEmail(this.props.email)
          .then(this.props.ok, this.props.no)} />
      </Widget>
    </Col>;
  }
}

export function resendEmail(email: string) {
  return axios.post(API.current.userResendConfirmationPath, { email });
}

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
