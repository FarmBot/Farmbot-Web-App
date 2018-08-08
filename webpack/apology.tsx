import * as React from "react";
import { Session } from "./session";

const STYLE: React.CSSProperties = {
  border: "2px solid #434343",
  background: "#a4c2f4",
  fontSize: "18px",
  color: "black",
  display: "block",
  overflow: "auto",
  padding: "1rem",
};

export function Apology(_: {}) {
  return <div style={STYLE}>
    <div>
      <h1>Page Error</h1>
      <span>
        We can't render this part of the page due to an unrecoverable error.
        Here are some thing you can try:
      </span>
      <ol>
        <li>
          Refresh the page.
        </li>
        <li>
          Perform a "hard refresh"
          (<strong>CTRL + SHIFT + R</strong> on most machines).
        </li>
        <li>
          <span>
            <a onClick={() => Session.clear()}>
              Restart the app by clicking here.
            </a>
            &nbsp;(You will be logged out of your account.)
          </span>
        </li>
        <li>
          <span>
            Send a report to our developer team via the&nbsp;
            <a href="http://forum.farmbot.org/c/software">FarmBot software
            forum</a>. Including additional information (such as steps leading up
            to the error) helps us identify solutions more quickly.
          </span>
        </li>
      </ol>
    </div>
  </div>;
}
