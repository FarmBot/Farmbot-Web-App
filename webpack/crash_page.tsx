import * as React from "react";
import { get, noop } from "lodash";
import { Page } from "./ui/index";
import { Session } from "./session";

/** Use currying to pass down `error` object for now. */
export function crashPage(error: object) {
  return class CrashPage extends React.Component<{}, {}> {
    render() {
      console.error("Dynamic page loading failed", error);
      const stack = get(error, "stack", "No stack.");
      const message = get(error, "message", "No message available.");
      const Rollbar = get(window, "Rollbar", { error: noop });
      Rollbar.error(error);
      let msg: string;
      try {
        msg = JSON.stringify({ message, stack });
      } catch (error) {
        msg = "Failed to extract error.";
      }

      return <Page>
        <h1> Something went wrong! </h1>
        <p>We hit an internal error while rendering this page.</p>
        <p>We have been notified of the issue and will investigate a solution shortly.</p>
        <hr />
        <h2>Resolving the Issue</h2>
        <ol>
          <li>Perform a "hard refresh" (<strong>CTRL + SHIFT + R</strong> on most machines).</li>
          <li><span><a onClick={() => Session.clear()}>Log out by clicking here.</a></span></li>
          <li>Send the error information (below) to our developer team via the
        <a href="http://forum.farmbot.org/c/software">FarmBot software
        forum</a>. Including additional information (such as steps leading up
        to the error) help us identify solutions more quickly. </li>
        </ol>
        <hr />
        <pre>
          <br />
          {msg}
        </pre>
      </Page>;
    }
  };
}
