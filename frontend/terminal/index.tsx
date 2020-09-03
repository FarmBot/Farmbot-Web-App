import { Farmbot } from "farmbot";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { AuthState } from "../auth/interfaces";

const node = document.createElement("DIV");
node.id = "root";
document.body.appendChild(node);
const terminal = new Terminal({});

terminal.open(node);

const session: AuthState | null =
  JSON.parse(localStorage["session"] || "false");

if (session) {
  const device = new Farmbot({
    token: session.token.encoded
  });
  device.connect().then(() => {
    device.on("*", (value: {}, event: string) => {
      terminal.writeln(JSON.stringify(event));
      terminal.writeln(JSON.stringify(value));
      console.dir(value);
    });
  });
} else {
  alert("You must be logged in for this");
  window.location.assign("/");
}
