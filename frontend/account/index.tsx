import * as React from "react";
import { connect } from "react-redux";
import {
  Settings, ChangePassword, ExportAccountPanel, DangerousDeleteWidget
} from "./components";
import { Props } from "./interfaces";
import { Page, Row, Col } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { User } from "../auth/interfaces";
import { edit, save } from "../api/crud";
import { updateNO } from "../resources/actions";
import { deleteUser, resetAccount } from "./actions";
import { success } from "farmbot-toastr/dist";
import { LabsFeatures } from "./labs/labs_features";
import { requestAccountExport } from "./request_account_export";
import { DevWidget } from "./dev/dev_widget";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { DevMode } from "./dev/dev_mode";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";

const KEYS: (keyof User)[] = ["id", "name", "email", "created_at", "updated_at"];

const isKey = (x: string): x is keyof User => KEYS.includes(x as keyof User);

interface State {
  warnThem: boolean;
}

@connect(mapStateToProps)
export class Account extends React.Component<Props, State> {
  state: State = { warnThem: false };

  /** WHAT WE NEED: The ability to tell users to check their email if they try
   *                changing their email address.
   *
   * WHAT THAT REQUIRES: Attribute-level dirty checking. Right now we're only
   *                     able to track changes at the record level (we know it
   *                     changed, but not which field).
   *
   * This is a quick fix until we can dedicate resources to implement
   * reversible edits to TaggedResource. I don't want to do anything weird like
   * store `TaggedResource`s in `this.state` (risk of storing invalid UUIDs).
   *
   * TODO: Implement attribute level dirty tracking
   */
  tempHack =
    (key: keyof User) => (key === "email") && this.setState({ warnThem: true });

  onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    if (isKey(name)) {
      this.tempHack(name);
      this.props.dispatch(edit(this.props.user, { [name]: value }));
    } else {
      throw new Error("Bad key: " + name);
    }
  };

  doSave = () => {
    const conf = this.state.warnThem ?
      t("Please check your email to confirm email address changes") : "Saved";
    success(t(conf), t("Success"));
    this.setState({ warnThem: false });
  }
  onSave = () => this
    .props
    .dispatch(save(this.props.user.uuid))
    .then(this.doSave, updateNO);

  render() {
    return <Page className="account-page">
      <Col xs={12} sm={6} smOffset={3}>
        <Row>
          <Settings
            user={this.props.user}
            onChange={this.onChange}
            onSave={this.onSave} />
        </Row>
        <Row>
          <ChangePassword />
        </Row>
        <Row>
          <LabsFeatures
            dispatch={this.props.dispatch}
            getConfigValue={this.props.getConfigValue} />
        </Row>
        <Row>
          <DangerousDeleteWidget
            title={t("Reset Account")}
            warning={t(Content.ACCOUNT_RESET_WARNING)}
            confirmation={t(Content.TYPE_PASSWORD_TO_RESET)}
            dispatch={this.props.dispatch}
            onClick={resetAccount} />
        </Row>
        <Row>
          <DangerousDeleteWidget
            title={t("Delete Account")}
            warning={t(Content.ACCOUNT_DELETE_WARNING)}
            confirmation={t(Content.TYPE_PASSWORD_TO_DELETE)}
            dispatch={this.props.dispatch}
            onClick={deleteUser} />
        </Row>
        <Row>
          <ExportAccountPanel onClick={requestAccountExport} />
        </Row>
        <Row>
          {this.props.getConfigValue("show_dev_menu" as BooleanConfigKey) &&
            <DevWidget dispatch={this.props.dispatch} />}
        </Row>
        <DevMode dispatch={this.props.dispatch} />
      </Col>
    </Page>;
  }
}
