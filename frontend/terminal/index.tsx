import { Farmbot } from "farmbot";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { AuthState } from "../auth/interfaces";

const node = document.createElement("DIV");
node.id = "root";
document.body.appendChild(node);
const terminal = new Terminal({});
const connectNo = () => { alert("Connection failed"); };

terminal.open(node);

const session: AuthState | null =
  JSON.parse(localStorage["session"] || "false");

let buffer = "";

if (session) {
  const device = new Farmbot({ token: session.token.encoded });
  device.connect().then(() => {
    console.log("OK");
    const { client } = device;
    if (client) {
      client.subscribe("bot/device_x/terminal_output");

      terminal.onKey(({ key: key }) => {
        buffer += key;
        switch (key) {
          case "\r":
            buffer += key
            console.dir("SENDING " + buffer);
            client.publish("bot/device_x/terminal_input", buffer);
            buffer = "";
            break;
          case String.fromCharCode(127):
            buffer = buffer.slice(0, -2);
            break;
          default:
            console.log(buffer);
        }
      });

      client.on("message", (m, payload) => {
        if (m.includes("terminal_output")) {
          terminal.write(payload);
        }
      });
    }
  }, connectNo);
} else {
  window.location.assign("/");
}
