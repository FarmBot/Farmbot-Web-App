import * as React from "react";
import { get } from "lodash";

/** Use currying to pass down `error` object for now. */
export function crashPage(error: object) {
  return class CrashPage extends React.Component<{}, {}> {
    render() {
      console.error("Dynamic page loading failed", error);
      const stack = get(error, "stack", "No stack.");
      const message = get(error, "message", "No message available.");

      Rollbar && Rollbar.error && Rollbar.error(message);

      let msg: string;
      try {
        msg = JSON.stringify({ message, stack });
      } catch (error) {
        msg = "Failed to extract error.";
      }

      return <div>
        <h1> Something went wrong! </h1>
        <p>We hit an internal error while rendering this page.</p>
        <p>We have been notified of the issue and will investigate a solution shortly.</p>
        <hr />
        <p>In the mean time, you can try the following:</p>
        <ul>
          <li> Refresh the page and log in again.</li>
          <li> Send the error information (below) to our developer team via the
        <a href="http://forum.farmbot.org/c/software">FarmBot software
        forum</a>. Including additional information (such as steps leading up
        to the error) help us identify solutions more quickly. </li>
        </ul>
        <hr />
        <pre>
          <br />
          {msg}
        </pre>
      </div>;
    }
  };
}
