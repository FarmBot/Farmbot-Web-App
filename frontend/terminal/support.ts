import { Terminal } from "@xterm/xterm";
import { AuthState } from "../auth/interfaces";

export const attachTerminal = () => {
  const node = document.getElementById("root");
  const terminal = new Terminal({});
  if (node) {
    terminal.open(node);
    terminal.resize(84, 24);
  }
  return terminal;
};

export const getCredentials = () => {
  const storedSession: string = localStorage["session"] || "false";
  const session: AuthState | false = JSON.parse(storedSession);
  if (session) {
    const { token } = session;
    const password = token.encoded;
    const username = token.unencoded.bot;

    return {
      password,
      username,
      url: token.unencoded.mqtt_ws
    };
  } else {
    return window.location.assign("/") as never;
  }
};
