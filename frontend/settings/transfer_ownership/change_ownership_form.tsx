import React from "react";
import { Row, BlurableInput, ExpandableHeader } from "../../ui";
import { success, error } from "../../toast/toast";
import { getDevice } from "../../device";
import { transferOwnership } from "./transfer_ownership";
import { API } from "../../api";
import {
  NonsecureContentWarning,
} from "../fbos_settings/nonsecure_content_warning";
import { Content, DeviceSetting } from "../../constants";
import { BlurablePassword } from "../../ui/blurable_password";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { Collapse } from "@blueprintjs/core";

interface ChangeOwnershipFormState {
  email: string;
  password: string;
  open: boolean;
}

export function submitOwnershipChange(input: ChangeOwnershipFormState) {
  const { email, password } = input;
  const ok = () => success(t("Received change of ownership."));
  const no = () => error(t("Bad username or password"));
  if (!email || !password) { return no(); }
  const p = { email, password, device: getDevice() };
  return transferOwnership(p).then(ok, no);
}

export class ChangeOwnershipForm
  extends React.Component<{}, ChangeOwnershipFormState> {

  state: ChangeOwnershipFormState = { email: "", password: "", open: false };

  render() {
    return <Highlight className={"section"}
      settingName={DeviceSetting.changeOwnership}>
      <ExpandableHeader
        expanded={this.state.open}
        title={t(DeviceSetting.changeOwnership)}
        onClick={() => this.setState({ open: !this.state.open })} />
      <Collapse isOpen={!!this.state.open}>
        <form className={"change-ownership-grid"}>
          <div>
            <p>
              {t("Change the account FarmBot is connected to.")}
            </p>
            <div className="change-ownership-grid">
              <label>
                {t("Email")}
              </label>
              <BlurableInput
                allowEmpty={true}
                onCommit={e => this.setState({ email: e.currentTarget.value })}
                name="email"
                value={this.state.email}
                type="email" />
              <label>
                {t("Password")}
              </label>
              <BlurablePassword
                onCommit={e => this.setState({ password: e.currentTarget.value })}
                name="password" />
              <label>
                {t("Server")}
              </label>
              <BlurableInput
                allowEmpty={true}
                onCommit={() => { }}
                name="server"
                disabled={true}
                value={API.current.baseUrl}
                type="text" />
            </div>
          </div>
          <Row>
            <NonsecureContentWarning
              urls={[API.current.baseUrl, location.protocol]}>
              <div>
                <strong>
                  {t(Content.NOT_HTTPS)}
                </strong>
                <p>
                  {t(Content.CONTACT_SYSADMIN)}
                </p>
              </div>
            </NonsecureContentWarning>
          </Row>
          <Row>
            <button
              className={"fb-button gray"}
              title={t("submit")}
              onClick={() => { submitOwnershipChange(this.state); }}>
              {t("submit")}
            </button>
          </Row>
        </form>
      </Collapse>
    </Highlight>;
  }
}
