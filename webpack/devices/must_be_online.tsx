import * as React from "react";
import { NetworkState } from "../connectivity/interfaces";
import { SyncStatus } from "farmbot";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  networkState: NetworkState;
  syncStatus: SyncStatus | undefined;
  lockOpen?: boolean;
  hideBanner?: boolean;
  children?: React.ReactNode | React.ReactNode[];
}

export function isBotUp(status: SyncStatus | undefined) {
  return status && !(["maintenance", "unknown"].includes(status));
}

export function MustBeOnline(props: MBOProps) {
  const { children, hideBanner, lockOpen, networkState, syncStatus } = props;
  const banner = hideBanner ? "" : "banner";
  const botUp = isBotUp(syncStatus);
  const netUp = networkState === "up";
  if ((botUp && netUp) || lockOpen) {
    return <div> {children} </div>;
  } else {
    return <div className={`unavailable ${banner}`}> {children} </div>;
  }
}
