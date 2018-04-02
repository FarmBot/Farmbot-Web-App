import * as React from "react";
import { Session } from "./session";

const STYLE: React.CSSProperties = {
  border: "2px solid red",
  background: "blue",
  fontSize: "24px",
  color: "black",
  display: "block",
  overflow: "auto"
};

export function Apology(_: {}) {
  return <div style={STYLE}>
    <p>
      <h1>Page Error</h1>
      <p>
        We can't render this part of the page due to an unrecoverable error.
        Here are some thing you can try:
      </p>
      <ol>
        <li>Perform a "hard refresh" (<strong>CTRL + SHIFT + R</strong> on most machines).</li>
        <li>
          <span>
            <a onClick={() => Session.clear()}>
              Restart the app by clicking here.
            </a>
          </span>
        </li>
        <li>
          Send the error information (below) to our developer team via the
        <a href="http://forum.farmbot.org/c/software">FarmBot software
        forum</a>. Including additional information (such as steps leading up
                  to the error) help us identify solutions more quickly.
        </li>
      </ol>
    </p>
  </div>;
}
