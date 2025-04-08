import React from "react";
import {
  WidgetBody, Widget, WidgetHeader, BlurableInput, BIProps,
} from "../ui";
import { resendEmail } from "./resend_verification";
import { success, error } from "../toast/toast";
import { bail } from "../util";
import { ResendPanelBody } from "./resend_panel_body";
import { Content } from "../constants";
import { t } from "../i18next_wrapper";

type RegKeyName =
  | "regConfirmation"
  | "regEmail"
  | "regName"
  | "regPassword";

type KeySetter = (keyName: RegKeyName, val: string) => void;

type KeyGetter = (keyName: RegKeyName) => string | undefined;

export interface CreateAccountProps {
  children?: React.ReactNode
  submitRegistration(e: React.FormEvent<{}>): void;
  sent: boolean;
  get: KeyGetter;
  set: KeySetter;
  callback(): void;
}

type FieldType = BIProps["type"];

export interface FormFieldProps {
  label: string;
  type: FieldType | "password";
  value: string;
  onCommit(val: string): void;
}

export const FormField = (props: FormFieldProps) =>
  <div className={"form-field"}>
    <label htmlFor={props.label}> {t(props.label)} </label>
    {props.type == "password"
      ? <input
        id={props.label}
        type={props.type}
        onBlur={e => props.onCommit(e.currentTarget.value)} />
      : <BlurableInput
        id={props.label}
        value={props.value}
        type={props.type}
        onCommit={e => props.onCommit(e.currentTarget.value)} />}
  </div>;

interface FieldData {
  label: string,
  type: FieldType | "password",
  keyName: RegKeyName
}

const FIELDS: FieldData[] = [
  { label: "Email", type: "email", keyName: "regEmail" },
  { label: "Name", type: "text", keyName: "regName" },
  { label: "Password", type: "password", keyName: "regPassword" },
  { label: "Verify Password", type: "password", keyName: "regConfirmation" },
];

export const MustRegister = (props: CreateAccountProps) => {
  return <WidgetBody>
    <form onSubmit={props.submitRegistration}>
      {FIELDS.map(field =>
        <FormField
          key={field.keyName}
          label={field.label}
          type={field.type}
          value={props.get(field.keyName) || ""}
          onCommit={(val) => props.set(field.keyName, val)} />)}
      {props.children}
      <button
        title={t("Create Account")}
        className="fb-button green create-account-button">
        {t("Create Account")}
      </button>
    </form>
  </WidgetBody>;
};

const MISSING_EMAIL = "User tried to resend to their registration email, " +
  "but none was found.";

export const sendEmail = (email: string, callback: () => void) => {
  const ok = () => {
    success(t(Content.VERIFICATION_EMAIL_RESENT));
    callback();
  };
  const no = () => {
    error(t(Content.VERIFICATION_EMAIL_RESEND_ERROR));
    callback();
  };

  return resendEmail(email).then(ok, no);
};

export const DidRegister = (props: CreateAccountProps) => {
  const email = props.get("regEmail");
  return email
    ? <ResendPanelBody onClick={() => { sendEmail(email, props.callback); }} />
    : bail(MISSING_EMAIL);
};

export const CreateAccount = (props: CreateAccountProps) => {
  const RelevantForm = props.sent ? DidRegister : MustRegister;
  return <div>
    <Widget>
      <WidgetHeader title={t("Create An Account")} />
      <RelevantForm {...props} />
    </Widget>
  </div>;
};
