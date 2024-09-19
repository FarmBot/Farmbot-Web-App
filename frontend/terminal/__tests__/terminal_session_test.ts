const mockClient = {
  once: jest.fn((_: string, fn: Function) => { fn(); }),
  on: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
};

jest.mock("mqtt", () => {
  return {
    connect: () => mockClient
  };
});

import { Terminal } from "@xterm/xterm";
import { TerminalSession } from "../terminal_session";

type FakeTerminal = Pick<Terminal, "write" | "onKey">;

describe("TerminalSession", () => {
  const FAKE_USERNAME = "device_123";
  const FAKE_PASSWORD = "password";
  const FAKE_URL = "ws://localhost:3000/wow";

  const fakeTerminal = (): FakeTerminal => {
    return { write: jest.fn(), onKey: jest.fn() };
  };

  const session = (terminal = fakeTerminal()) => {
    return new TerminalSession(FAKE_URL, FAKE_USERNAME, FAKE_PASSWORD, terminal);
  };

  it("formats appropriate AMQP channel names", () => {
    const ts = session();
    expect(ts.rx).toEqual(`bot/${FAKE_USERNAME}/terminal_output`);
    expect(ts.tx).toEqual(`bot/${FAKE_USERNAME}/terminal_input`);
  });

  it("erases characters from the buffer", () => {
    const ts = session();
    ts.buffer = "wow!";
    expect(ts.buffer).toEqual("wow!");
    ts.erase(0);
    ts.erase(-100);
    expect(ts.buffer).toEqual("wow!");
    ts.erase(1);
    expect(ts.buffer).toEqual("wow");
    ts.clearBuffer();
    expect(ts.buffer).toEqual("");
  });

  it("handles incoming messages from remote device", () => {
    const terminal = fakeTerminal();
    const ts = session(terminal);
    const bufStr = "Hello, world!";
    const buffer = Buffer.from(bufStr, "utf8");
    ts.terminalMessageHandler(ts.rx, buffer);
    ts.terminalMessageHandler("Something else", Buffer.from("no", "utf8"));
    expect(terminal.write).toHaveBeenCalledWith(buffer);
  });

  it("Does not send empty carriage returns to the device", () => {
    const ts = session();
    ts.buffer = "";
    ts.terminalKeyboardHandler({ key: "\r" });
    expect(mockClient.publish).not.toHaveBeenCalled();
    expect(ts.buffer).toEqual("");
    ts.buffer = "IO.puts(\"Elixir\")";
    ts.terminalKeyboardHandler({ key: "\r" });
    expect(mockClient.publish).toHaveBeenCalled();
    expect(ts.buffer).toEqual("");
  });

  it("handles backspace", () => {
    const ts = session();
    const NACHOS = "NACHOS";
    NACHOS.split("").map((key) => ts.terminalKeyboardHandler({ key }));
    expect(ts.buffer).toEqual(NACHOS);
    ts.terminalKeyboardHandler({ key: "\b" });
    expect(ts.buffer).toEqual("NACHO");
    ts.terminalKeyboardHandler({ key: String.fromCharCode(127) });
    expect(ts.buffer).toEqual("NACH");
  });

  it("connects to the server", async () => {
    const terminal = fakeTerminal();
    const ts = session(terminal);
    await ts.connect();

    expect(mockClient.subscribe).toHaveBeenCalledWith(ts.rx);
    expect(terminal.onKey).toHaveBeenCalledWith(ts.terminalKeyboardHandler);
    expect(mockClient.on).toHaveBeenCalledWith("message", ts.terminalMessageHandler);
    expect(mockClient.once).toHaveBeenCalledWith("connect", expect.any(Function));
  });
});
