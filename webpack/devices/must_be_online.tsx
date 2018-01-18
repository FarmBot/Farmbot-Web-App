import * as React from "react";
import { JSXChildren } from "../util";
import { NetworkState } from "../connectivity/interfaces";
import { SyncStatus } from "farmbot";

/** Properties for the <MustBeOnline/> element. */
export interface MBOProps {
  networkState: NetworkState;
  botState: SyncStatus | undefined;
  lockOpen?: boolean;
  hideBanner?: boolean;
  children?: JSXChildren;
}

export function MustBeOnline({ children, hideBanner, lockOpen, networkState, botState }: MBOProps) {
  const banner = hideBanner ? "" : "banner";
  const botUp = botState && (botState !== "maintenance");
  const netUp = networkState === "up";
  if ((botUp && netUp) || lockOpen) {
    return <div> {children} </div>;
  } else {
    return <div className={`unavailable ${banner}`}> {children} </div>;
  }
}
