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
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { Collapse } from "@blueprintjs/core";
import { clone, noop } from "lodash";

interface Form {
  email: string;
  password: string;
}

export function submitOwnershipChange(input: Form) {
  const { email, password } = input;
  const ok = () => success(t("Received change of ownership."));
  const no = () => error(t("Bad username or password"));
  if (!email || !password) { return no(); }
  const p = { email, password, device: getDevice() };
  return transferOwnership(p).then(ok, no);
}

export const ChangeOwnershipForm = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // eslint-disable-next-line no-null/no-null
  const inputRef = React.useRef<HTMLInputElement>(null);

  return <Highlight className={"section"}
    settingName={DeviceSetting.changeOwnership}>
    <ExpandableHeader
      expanded={open}
      title={t(DeviceSetting.changeOwnership)}
      onClick={() => setOpen(!open)} />
    <Collapse isOpen={!!open}>
      <div className={"change-ownership-grid"}>
        <div>
          <p>
            {t("Change the account FarmBot is connected to.")}
          </p>
          <div className="change-ownership-grid">
            <label htmlFor={"email"}>
              {t("Email")}
            </label>
            <BlurableInput
              id={"email"}
              allowEmpty={true}
              onCommit={e => setEmail(e.currentTarget.value)}
              value={email}
              type={"email"} />
            <label htmlFor={"password"}>
              {t("Password")}
            </label>
            <input
              ref={inputRef}
              id={"password"}
              type={"password"}
              onBlur={e => setPassword(e.currentTarget.value)} />
            <label htmlFor={"server"}>
              {t("Server")}
            </label>
            <BlurableInput
              id={"server"}
              allowEmpty={true}
              onCommit={noop}
              disabled={true}
              value={API.current.baseUrl}
              type={"text"} />
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
            onClick={() => {
              const payload: Form = clone({ email, password });
              inputRef.current && (inputRef.current.value = "");
              setPassword("");
              setEmail("");
              submitOwnershipChange(payload);
            }}>
            {t("submit")}
          </button>
        </Row>
      </div>
    </Collapse>
  </Highlight>;
};
