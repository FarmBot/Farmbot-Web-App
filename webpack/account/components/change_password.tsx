import * as React from "react";
import { t } from "i18next";
import {
  BlurableInput,
  Widget,
  WidgetHeader,
  WidgetBody,
  SaveBtn
} from "../../ui/index";
import { SpecialStatus } from "../../resources/tagged_resources";
import Axios from "axios";
import { API } from "../../api/index";
import { prettyPrintApiErrors, equals, trim } from "../../util";
import { success, error } from "farmbot-toastr/dist";
import { Content } from "../../constants";
import { uniq } from "lodash";

interface PasswordForm {
  new_password: string;
  new_password_confirmation: string;
  password: string;
}

interface ChangePWState { status: SpecialStatus; form: PasswordForm }

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
    Axios
      .patch(API.current.usersPath, this.state.form)
      .then(() => {
        success(t("Your password is changed."),t("Success"));
        this.clearForm();
      }, (e) => {
        error(e ? prettyPrintApiErrors(e) : t("Password change failed."),t("Error"));
        this.clearForm();
      });

  save = () => {
    const numUniqueValues = uniq(Object.values(this.state.form)).length;
    switch (numUniqueValues) {
      case 1:
        error(t("Provided new and old passwords match. Password not changed."),t("Error"));
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
        error(t("New password and confirmation do not match."),t("Error"));
        this.clearForm();
        break;
      default:
        this.clearForm();
        throw new Error(trim(`Password change form error:
          ${numUniqueValues} unique values provided.`));
    }
  }

  render() {
    return <Widget>
      <WidgetHeader title={t("Change Password")}>
        <SaveBtn onClick={this.save} status={this.state.status} />
      </WidgetHeader>
      <WidgetBody>
        <form>
          <label>
            {t("Old Password")}
          </label>
          <BlurableInput
            allowEmpty={true}
            onCommit={this.set("password")}
            name="password"
            value={this.state.form.password}
            type="password" />
          <label>
            {t("New Password")}
          </label>
          <BlurableInput
            allowEmpty={true}
            onCommit={this.set("new_password")}
            name="new_password"
            value={this.state.form.new_password}
            type="password" />
          <label>
            {t("Confirm New Password")}
          </label>
          <BlurableInput
            allowEmpty={true}
            onCommit={this.set("new_password_confirmation")}
            name={"new_password_confirmation"}
            value={this.state.form.new_password_confirmation}
            type="password" />
        </form>
      </WidgetBody>
    </Widget>;
  }
}