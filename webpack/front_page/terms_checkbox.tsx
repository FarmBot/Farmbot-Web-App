import * as React from "react";
import { t } from "i18next";
import { PartialFormEvent } from "./front_page";

export const TermsCheckbox = (props: {
  privUrl: string,
  tosUrl: string,
  onChange: (event: PartialFormEvent) => void,
  agree: boolean | undefined,
}) =>
  <div className="tos">
    {`${t("I agree to the")} `}
    <a href={props.privUrl} target="_blank">{t("Privacy Policy")}</a>
    {` ${t("and")} `}
    <a href={props.tosUrl} target="_blank">{t("Terms of Use")}</a>
    <input type="checkbox"
      onChange={props.onChange}
      value={props.agree ? "false" : "true"} />
  </div>;
