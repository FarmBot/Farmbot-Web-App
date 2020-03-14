import * as React from "react";
import { NetworkState } from "../connectivity/interfaces";
import { SyncStatus } from "farmbot";
import { Content } from "../constants";
import { t } from "../i18next_wrapper";
import { BotState } from "./interfaces";
import { getStatus } from "../connectivity/reducer_support";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  networkState: NetworkState;
  syncStatus: SyncStatus | undefined;
  lockOpen?: boolean;
  hideBanner?: boolean;
  children?: React.ReactNode;
}

export function isBotUp(status: SyncStatus | undefined) {
  return status && !(["maintenance", "unknown"].includes(status));
}

export function isBotOnline(
  syncStatus: SyncStatus | undefined,
  botToMqttStatus: NetworkState): boolean {
  return !!(isBotUp(syncStatus) && botToMqttStatus === "up");
}

export function isBotOnlineFromState(bot: BotState) {
  const { sync_status } = bot.hardware.informational_settings;
  const { uptime } = bot.connectivity;
  return isBotOnline(sync_status, getStatus(uptime["bot.mqtt"]));
}

export function MustBeOnline(props: MBOProps) {
  const { children, hideBanner, lockOpen, networkState, syncStatus } = props;
  const banner = hideBanner ? "" : "banner";
  if (isBotOnline(syncStatus, networkState) || lockOpen) {
    return <div className={"bot-is-online-wrapper"}>{children}</div>;
  } else {
    return <div
      className={`unavailable ${banner}`}
      title={t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}>
      {children}
    </div>;
  }
}
