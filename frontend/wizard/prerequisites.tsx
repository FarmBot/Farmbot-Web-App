import React from "react";
import { SetupWizardContent } from "../constants";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { t } from "../i18next_wrapper";
import { store } from "../redux/store";
import { BlurableInput } from "../ui";
import { WizardData } from "./data";

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

export const ProductRegistration = () =>
  <div className={"product-registration"}>
    <label>{t("Order number")}</label>
    <BlurableInput value={WizardData.getOrderNumber()}
      onCommit={e => WizardData.setOrderNumber(e.currentTarget.value)} />
  </div>;
