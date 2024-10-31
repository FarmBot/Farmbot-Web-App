import React from "react";
import { Session } from "./session";
import { ExternalUrl } from "./external_urls";

const OUTER_STYLE: React.CSSProperties = {
  borderRadius: "10px",
  background: "repeating-linear-gradient(-45deg," +
    "#ffff55, #ffff55 20px," +
    "#ff5555 20px, #ff5555 40px)",
  fontSize: "100%",
  color: "black",
  display: "block",
  overflow: "auto",
  padding: "1rem",
  margin: "1rem",
};

const INNER_STYLE: React.CSSProperties = {
  borderRadius: "10px",
  background: "#ffffffdd",
  padding: "1rem",
};

export function Apology(_: {}) {
  return <div style={OUTER_STYLE}>
    <div style={INNER_STYLE}>
      <h1 style={{ fontSize: "175%" }}>Page Error</h1>
      <span>
        {"We can't render this part of the page due to an unrecoverable error."}
        &nbsp;Here are some things you can try:
      </span>
      <ol>
        <li>
          Click back and then refresh the page.
        </li>
        <li>
          {"Perform a \"hard refresh\""}
          &nbsp;(<strong>CTRL + SHIFT + R</strong> on most machines).
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
            <a href={ExternalUrl.softwareForum}>FarmBot software forum</a>.
            Including additional information (such as steps leading up
            to the error) helps us identify solutions more quickly.
          </span>
        </li>
      </ol>
    </div>
  </div>;
}
