import React from "react";
import { SaveBtn, Row } from "../../ui";
import { SpecialStatus } from "farmbot";
import axios from "axios";
import { API } from "../../api/index";
import { prettyPrintApiErrors, equals, trim, AxiosErrorResponse } from "../../util";
import { Content, DeviceSetting } from "../../constants";
import { uniq } from "lodash";
import { BlurablePassword } from "../../ui/blurable_password";
import { t } from "../../i18next_wrapper";
import { success, error } from "../../toast/toast";

interface PasswordForm {
  new_password: string;
  new_password_confirmation: string;
  password: string;
}

export interface ChangePWState { status: SpecialStatus; form: PasswordForm }

const EMPTY_FORM =
  ({ new_password: "", new_password_confirmation: "", password: "" });

export class ChangePassword extends React.Component<{}, ChangePWState> {
  state: ChangePWState = { status: SpecialStatus.SAVED, form: EMPTY_FORM };

  componentWillUnmount() {
    this.clearForm();
  }

  /** Set the `status` flag to `undefined`, but only if the form is empty.
   * Useful when the user manually clears the form. */
  maybeClearForm =
    () => equals(EMPTY_FORM, this.state.form) ? this.clearForm() : false;

  clearForm = () => this.setState({ status: SpecialStatus.SAVED, form: EMPTY_FORM });

  set = (key: keyof PasswordForm) =>
    (e: React.SyntheticEvent<HTMLInputElement>) => {
      const wow = {
        status: SpecialStatus.DIRTY,
        form: { ...this.state.form, [key]: e.currentTarget.value }
      };
      this.setState(wow, this.maybeClearForm);
    };

  sendChange = () =>
    axios
      .patch(API.current.usersPath, this.state.form)
      .then(() => {
        success(t("Your password is changed."));
        this.clearForm();
      }, (e: AxiosErrorResponse) => {
        error(prettyPrintApiErrors(e));
        this.clearForm();
      });

  save = () => {
    if (this.state.form.new_password.length < 8) {
      error(t("New password must be at least 8 characters."));
      this.clearForm();
      return;
    }
    const numUniqueValues = uniq(Object.values(this.state.form)).length;
    switch (numUniqueValues) {
      case 1:
        error(t("Provided new and old passwords match. Password not changed."));
        this.clearForm();
        break;
      case 2:
        if (confirm(t(Content.ACCOUNT_PASSWORD_CHANGE))) {
          this.setState({ status: SpecialStatus.SAVING });
          this.sendChange();
        }
        this.clearForm();
        break;
      case 3:
        error(t("New password and confirmation do not match."));
        this.clearForm();
        break;
      default:
        this.clearForm();
        throw new Error(trim(`Password change form error:
          ${numUniqueValues} unique values provided.`));
    }
  };

  render() {
    return <Row className={"change-password zero-side-margins"}>
      <label>
        {t(DeviceSetting.changePassword)}
      </label>
      <SaveBtn onClick={this.save} status={this.state.status} />
      <form>
        <div className={"old-password"}>
          <label>
            {t("Old Password")}
          </label>
          <BlurablePassword
            onCommit={this.set("password")}
            name="password" />
        </div>
        <div className={"new-password"}>
          <label>
            {t("New Password")}
          </label>
          <BlurablePassword
            onCommit={this.set("new_password")}
            name="new_password" />
        </div>
        <div className={"new-password"}>
          <label>
            {t("Confirm New Password")}
          </label>
          <BlurablePassword
            onCommit={this.set("new_password_confirmation")}
            name={"new_password_confirmation"} />
        </div>
      </form>
    </Row>;
  }
}
