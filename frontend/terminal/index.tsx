import "@xterm/xterm/css/xterm.css";
import { getCredentials, attachTerminal } from "./support";
import { TerminalSession } from "./terminal_session";

const { password, username, url } = getCredentials();
const session = new TerminalSession(url, username, password, attachTerminal());
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).terminal_session = session;
session.connect();

