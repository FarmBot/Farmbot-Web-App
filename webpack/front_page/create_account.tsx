import * as React from "react";
import { WidgetBody, Col, Widget, WidgetHeader, Row, BlurableInput } from "../ui/index";
import { t } from "i18next";

type RegKeyName =
  | "regConfirmation"
  | "regEmail"
  | "regName"
  | "regPassword";

type KeySetter = (key: RegKeyName, val: string) => void;

type KeyGetter = (key: RegKeyName) => string | undefined;

interface CreateAccountProps {
  children?: React.ReactChild
  submitRegistration(e: React.FormEvent<{}>): void;
  sent: boolean;
  get: KeyGetter;
  set: KeySetter;
}

type FieldType =
  | "email"
  | "password"
  | "text";

interface RegistrationFieldProps {
  label: string;
  key: RegKeyName;
  set: KeySetter;
  get: KeyGetter;
  type: FieldType;
}

export function DidRegister(props: CreateAccountProps) {
  return <p> TODO </p>;
}

export function RegistrationField(props: RegistrationFieldProps) {
  const label = t(props.label);
  const p = {
    value: (props.get(name) || ""),
    onCommit: (e: React.SyntheticEvent<HTMLInputElement>) => {
      props.set(props.key, e.currentTarget.value);
    }
  };

  return <div>
    <label> {label} </label>
    <BlurableInput {...p} type={props.type || "text"} />
  </div>;
}

export const fieldGenerator =
  (set: KeySetter, get: KeyGetter) =>
    (label: string, key: RegKeyName, type: FieldType = "text") => {
      return <RegistrationField
        label={label}
        type={type}
        key={key}
        set={set}
        get={get} />;
    };

export function MustRegister(props: CreateAccountProps) {
  const field = fieldGenerator(props.set, props.get);

  return <WidgetBody>
    <form onSubmit={props.submitRegistration}>
      {[
        field("Email", "regEmail", "email"),
        field("Name", "regName"),
        field("Password", "regPassword", "password"),
        field("Verify Password", "regConfirmation", "password"),
        props.children
      ]}
      <Row>
        <button
          className="fb-button green front-page-button">
          {t("Create Account")}
        </button>
      </Row>
    </form>
  </WidgetBody>;
}

export function CreateAccount(props: CreateAccountProps) {
  const Form = props.sent ? DidRegister : MustRegister;
  return <Col xs={12} sm={5}>
    <Widget>
      <WidgetHeader title={"Create An Account"} />
      {<Form {...props} />}
    </Widget>
  </Col>;
}
