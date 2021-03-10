import React from "react";
import { edit, save } from "../api/crud";
import { SetupWizardContent } from "../constants";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { t } from "../i18next_wrapper";
import { store } from "../redux/store";
import { getDeviceAccountSettings } from "../resources/selectors";
import { BlurableInput } from "../ui";
import { WizardStepComponentProps } from "./interfaces";

const botOnlinePrereqStatus = () =>
  isBotOnlineFromState(store.getState().bot);

const botOnlinePrereqMessage = () =>
  botOnlinePrereqStatus()
    ? <p>{t("bot is online")}</p>
    : <p>{t(SetupWizardContent.OFFLINE)}</p>;

export const botOnlineReq = {
  status: botOnlinePrereqStatus,
  indicator: botOnlinePrereqMessage,
};

export const ProductRegistration = (props: WizardStepComponentProps) => {
  const device = getDeviceAccountSettings(props.resources);
  return <div className={"product-registration"}>
    <label>{t("Order number")}</label>
    <BlurableInput value={device.body.fb_order_number || ""}
      onCommit={e => {
        props.dispatch(edit(device, { fb_order_number: e.currentTarget.value }));
        props.dispatch(save(device.uuid));
      }} />
  </div>;
};
