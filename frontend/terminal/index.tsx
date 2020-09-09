import "xterm/css/xterm.css";
import { getCredentials, attachTerminal } from "./support";
import { TerminalSession } from "./terminal_session";

const { password, username, url } = getCredentials();
const session = new TerminalSession(url, username, password, attachTerminal());

session.connect();
