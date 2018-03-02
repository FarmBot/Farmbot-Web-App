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
import { prettyPrintApiErrors, equals } from "../../util";
import { success, error } from "farmbot-toastr/dist";

interface PasswordForm {
  new_password: string;
  new_password_confirmation: string;
  password: string;
}

interface ChangePWState {
  status: SpecialStatus;
  form: PasswordForm
}
const EMPTY_FORM = {
  new_password: "",
  new_password_confirmation: "",
  password: ""
};

export class ChangePassword extends React.Component<{}, ChangePWState> {
  state: ChangePWState = {
    status: SpecialStatus.SAVED,
    form: EMPTY_FORM
  };

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

  save = () => {
    this.setState({ status: SpecialStatus.SAVING });
    Axios
      .patch(API.current.usersPath, this.state.form)
      .then((r) => {
        success(t("Your password is changed."));
        this.clearForm();
      }, (e) => {
        error(e ? prettyPrintApiErrors(e) : t("Password change failed."));
        this.clearForm();
      });
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
            {t("New Password")}
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
