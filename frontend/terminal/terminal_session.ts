import { times } from "lodash";
import mqtt, { MqttClient } from "mqtt";
import { Terminal } from "@xterm/xterm";

type TerminalLike = Pick<Terminal, "write" | "onKey">;
type KeysWeNeed = "publish" | "on" | "once" | "subscribe";

const CR = "\r";
const DELETE = String.fromCharCode(127);
const BACKSPACE = "\b";
const EMPTY_BUFFER = [CR, (CR + CR), ""];

export class TerminalSession {
  buffer = "";
  private client: Pick<MqttClient, KeysWeNeed>;

  constructor(url: string, public username: string,
    password: string,
    private terminal: TerminalLike) {
    this.client = mqtt.connect(url, { username, password });
  }

  get rx() { return `bot/${this.username}/terminal_output`; }
  get tx() { return `bot/${this.username}/terminal_input`; }

  upload = (payload: string) => this.client.publish(this.tx, payload);

  connect = () => {
    return new Promise((resolve) => {
      this.client.once("connect", () => {
        this.client.subscribe(this.rx);
        this.terminal.onKey(this.terminalKeyboardHandler);
        this.client.on("message", this.terminalMessageHandler);
      });
      resolve("");
    });
  };

  erase = (n: number) => {
    times(Math.max(0, n), () => {
      this.terminal.write(`${BACKSPACE} ${BACKSPACE}`);
      this.buffer = this.buffer.slice(0, -1);
    });
  };

  clearBuffer = () => {
    this.erase(this.buffer.length);
    this.buffer = "";
  };

  terminalMessageHandler = (m: string, payload: Buffer) => {
    if (m.includes("terminal_output")) {
      this.terminal.write(payload);
    }
  };

  terminalKeyboardHandler = ({ key: key }: { key: string }) => {
    switch (key) {
      case CR:
        if (!EMPTY_BUFFER.includes(this.buffer)) {
          this.upload(this.buffer + key);
        }
        this.clearBuffer();
        break;
      case BACKSPACE:
      case DELETE:
        this.erase(1);
        break;
      default:
        this.buffer += key;
        this.terminal.write(key);
    }
  };
}
