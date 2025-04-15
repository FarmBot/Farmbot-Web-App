import React from "react";
import { SaveBtn } from "../../ui";
import { SpecialStatus } from "farmbot";
import axios from "axios";
import { API } from "../../api/index";
import { prettyPrintApiErrors, AxiosErrorResponse } from "../../util";
import { Content, DeviceSetting } from "../../constants";
import { clone, uniq } from "lodash";
import { t } from "../../i18next_wrapper";
import { success, error } from "../../toast/toast";

interface PasswordForm {
  new_password: string;
  new_password_confirmation: string;
  password: string;
}

export interface ChangePWState {
  status: SpecialStatus;
  form: PasswordForm;
}

export const ChangePassword = () => {
  const [status, setStatus] = React.useState(SpecialStatus.SAVED);
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = React.useState("");

  const form = {
    password,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  };

  // eslint-disable-next-line no-null/no-null
  const formRef = React.useRef<HTMLDivElement>(null);

  const clearForm = () => {
    setStatus(SpecialStatus.SAVED);
    setPassword("");
    setNewPassword("");
    setNewPasswordConfirmation("");
    if (formRef.current) {
      formRef.current.querySelectorAll("input").forEach((input) => {
        input.value = "";
      });
    }
  };

  const sendChange = () =>
    axios
      .patch(API.current.usersPath, clone(form))
      .then(() => {
        success(t("Your password is changed."));
        clearForm();
      }, (e: AxiosErrorResponse) => {
        error(prettyPrintApiErrors(e));
        clearForm();
      });

  const save = () => {
    if (newPassword.length < 8) {
      error(t("New password must be at least 8 characters."));
      clearForm();
      return;
    }
    const numUniqueValues = uniq(Object.values(form)).length;
    switch (numUniqueValues) {
      case 1:
        error(t("Provided new and old passwords match. Password not changed."));
        clearForm();
        break;
      case 2:
        if (confirm(t(Content.ACCOUNT_PASSWORD_CHANGE))) {
          setStatus(SpecialStatus.SAVING);
          sendChange();
        }
        clearForm();
        break;
      case 3:
        error(t("New password and confirmation do not match."));
        clearForm();
        break;
    }
  };

  return <div className={"change-password grid"}>
    <div className="row grid-exp-1">
      <label>
        {t(DeviceSetting.changePassword)}
      </label>
      <SaveBtn onClick={save} status={status} />
    </div>
    <div
      ref={formRef}
      className={"grid grid-2-col"}>
      <label htmlFor={"password"}>
        {t("Old Password")}
      </label>
      <input
        id={"password"}
        type={"password"}
        onBlur={e => {
          setStatus(SpecialStatus.DIRTY);
          setPassword(e.target.value);
        }} />
      <label htmlFor={"new_password"}>
        {t("New Password")}
      </label>
      <input
        id={"new_password"}
        type={"password"}
        onBlur={e => {
          setStatus(SpecialStatus.DIRTY);
          setNewPassword(e.target.value);
        }} />
      <label htmlFor={"new_password_confirmation"}>
        {t("Confirm New Password")}
      </label>
      <input
        id={"new_password_confirmation"}
        type={"password"}
        onBlur={e => {
          setStatus(SpecialStatus.DIRTY);
          setNewPasswordConfirmation(e.target.value);
        }} />
    </div>
  </div>;
};
