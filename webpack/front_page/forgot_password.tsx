import * as React from "react";
import { Col, Widget, WidgetHeader, WidgetBody, BlurableInput, Row } from "../ui/index";
import { t } from "i18next";

interface X<T> extends React.SyntheticEvent<T> { }
interface ForgotPasswordProps {
  onToggleForgotPassword(e: React.MouseEvent<HTMLButtonElement>): void;
  onSubmit(e: React.FormEvent<HTMLFormElement>): void;
  email: string;
  onEmailChange(e: X<HTMLInputElement>): void;
}

export function ForgotPassword(props: ForgotPasswordProps) {
  const {
    onToggleForgotPassword,
    onSubmit,
    email,
    onEmailChange,
  } = props;
  return <Col xs={12} sm={5}>
    <Widget>
      <WidgetHeader title={"Reset Password"}>
        <button
          className="fb-button gray"
          onClick={onToggleForgotPassword} >
          {t("BACK")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <form onSubmit={onSubmit}>
          <label>{t("Enter Email")}</label>
          <BlurableInput
            type="email"
            value={email}
            onCommit={onEmailChange} />
          <Row>
            <button
              className="fb-button green front-page-button">
              {t("Reset Password")}
            </button>
          </Row>
        </form>
      </WidgetBody>
    </Widget>
  </Col>;
}
