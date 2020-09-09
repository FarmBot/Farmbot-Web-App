import "xterm/css/xterm.css";

import { connect } from "mqtt";
import { Terminal } from "xterm";
import { AuthState } from "../auth/interfaces";

const node = document.createElement("DIV");
node.id = "root";
document.body.appendChild(node);
const terminal = new Terminal({});
terminal.open(node);

const storedSession = localStorage["session"] || "false";
const session: AuthState | null = JSON.parse(storedSession);

let buffer = "";

if (session) {
  const { encoded, unencoded } = session.token;
  const username = (unencoded as any).bot;
  const output = `bot/${username}/terminal_output`;
  const input = `bot/${username}/terminal_input`;
  const client = connect((unencoded as any).mqtt_ws, {
    username,
    password: encoded
  })
  console.log("Trying to connect...");
  client.once("connect", () => {
    console.log("connected");
    client.subscribe(output);
    client.publish(input, "RingLogger.attach()\r")
    terminal.onKey(({ key: key }) => {
      buffer += key;
      console.log(buffer);
      switch (key) {
        case "\r":
          if (!["\r", "\r\r"].includes(buffer)) {
            client.publish(input, buffer);
          }
          buffer = "";
          break;
        case "\b":
        case String.fromCharCode(127):
          buffer = buffer.slice(0, -2);
          terminal.write('\x1b[D');
          break;
        default:
          terminal.write(key);
      }
    });

    client.on("message", (m, payload) => {
      console.log("Channel: " + m);
      if (m.includes("terminal_output")) {
        terminal.write(payload);
      }
    });

  });
} else {
  window.location.assign("/");
}
