import React, { ReactChild } from "react";
import { detectLanguage } from "../i18n";
import { shortRevision, attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I from "i18next";

/** The Demo loader works by creating a new guest user auth token and logging
 * the guest in with said token. If the user is already logged in, the user
 * is presented with choices about how to procede.*/

namespace State {
  /** === Level 0: Initialization */
  export interface Start {
    current: "start"
  }

  /** === Level 1: If a token is present in localStorage,
   * determine if user wishes to use it. */
  interface HasToken { token: string; }

  export interface DetermineTokenIntent extends HasToken {
    current: "DetermineTokenIntent"
  }

  export interface HasAndWantsOldToken extends HasToken {
    current: "DontUseOldToken";
  }

  export interface DoesNotWantOldToken extends HasToken {
    current: "UseOldToken";
  }

  export interface WantsNewToken {
    current: "missingToken";
  }

  /** === Level 2: Token Fetching */

  export interface TokenFetchError {
    current: "TokenFetchError";
  }

  /** === Level 2: Forward to app */

  export interface ReadyToDemo extends HasToken {
    current: "readyToDemo";
  }
}

type DemoState =
  | State.Start
  | State.DetermineTokenIntent
  | State.HasAndWantsOldToken
  | State.DoesNotWantOldToken
  | State.WantsNewToken
  | State.TokenFetchError
  | State.ReadyToDemo;

export class AppDemoLoader extends React.Component<{}, DemoState> {
  state: State.Start = { current: "start" };

  transitions: Record<DemoState["current"], () => ReactChild> = {
    "start": () => <div>Work in progress</div>,
    "DetermineTokenIntent": () => <div>Work in progress</div>,
    "DontUseOldToken": () => <div>Work in progress</div>,
    "UseOldToken": () => <div>Work in progress</div>,
    "missingToken": () => <div>Work in progress</div>,
    "TokenFetchError": () => <div>Work in progress</div>,
    "readyToDemo": () => <div>Work in progress</div>,
  };

  render() {
    return this.transitions[this.state.current]();
  }
}

stopIE();

console.log(shortRevision());

detectLanguage().then((config) => {
  I.init(config, () => attachToRoot(AppDemoLoader));
});
