import React from "react";
import { NetworkState } from "../connectivity/interfaces";
import { SyncStatus } from "farmbot";
import { Content } from "../constants";
import { t } from "../i18next_wrapper";
import { BotState } from "./interfaces";
import { getStatus } from "../connectivity/reducer_support";
import { maybeFetchUser } from "../resources/selectors";
import { store } from "../redux/store";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  networkState: NetworkState;
  syncStatus: SyncStatus | undefined;
  hideBanner?: boolean;
  children?: React.ReactNode;
}

/** Demo account (and dev) bot online override. */
export const forceOnline = () => {
  const user = maybeFetchUser(store.getState().resources.index);
  return user?.body.email.endsWith("@farmbot.guest")
    || localStorage.getItem("myBotIs") == "online";
};

/** Used for E-STOP button: ignores ping/pong-derived status. */
export function isBotUp(status: SyncStatus | undefined) {
  const lockOpen = forceOnline();
  return (status && !(["maintenance", "unknown"].includes(status))) || lockOpen;
}

export function isBotOnline(
  syncStatus: SyncStatus | undefined,
  botToMqttStatus: NetworkState,
): boolean {
  return !!(isBotUp(syncStatus) && (botToMqttStatus === "up") || forceOnline());
}

export function isBotOnlineFromState(bot: BotState) {
  const { sync_status } = bot.hardware.informational_settings;
  const { uptime } = bot.connectivity;
  return isBotOnline(sync_status, getStatus(uptime["bot.mqtt"]));
}

export function MustBeOnline(props: MBOProps) {
  const { children, hideBanner, networkState, syncStatus } = props;
  const banner = hideBanner ? "" : "banner";
  if (isBotOnline(syncStatus, networkState)) {
    return <div className={"bot-is-online-wrapper"}>{children}</div>;
  } else {
    return <div
      className={`unavailable ${banner}`}
      title={t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}>
      {children}
    </div>;
  }
}
