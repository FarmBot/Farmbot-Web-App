import { Terminal } from "xterm";
import { TerminalSession } from "../terminal_session";

type FakeTerminal = Pick<Terminal, "write" | "onKey">;

describe("TerminalSession", () => {
  const FAKE_USERNAME = "device_123";
  const FAKE_PASSWORD = "password";
  const FAKE_URL = "ws://localhost:3000/wow";

  const fakeTerminal = (): FakeTerminal => {
    return { write: jest.fn(), onKey: jest.fn() };
  };

  const create = (terminal: FakeTerminal) => {
    return new TerminalSession(FAKE_URL, FAKE_USERNAME, FAKE_PASSWORD, terminal);
  };

  it("formats appropriate AMQP channel names", () => {
    const terminal = fakeTerminal();
    const ts = create(terminal);
    expect(ts.rx).toEqual(`bot/${FAKE_USERNAME}/terminal_output`);
    expect(ts.tx).toEqual(`bot/${FAKE_USERNAME}/terminal_input`);
  });

  it("erases characters from the buffer", () => {
    const terminal = fakeTerminal();
    const ts = create(terminal);
    ts.buffer = "wow!";
    expect(ts.buffer).toEqual("wow!");
    ts.erase(0);
    ts.erase(-100);
    expect(ts.buffer).toEqual("wow!");
    ts.erase(1);
    expect(ts.buffer).toEqual("wow");
  });
});
