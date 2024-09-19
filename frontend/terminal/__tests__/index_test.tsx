jest.mock("@xterm/xterm/css/xterm.css", () => { });
const mockTS = { connect: jest.fn() };
jest.mock("../terminal_session", () => ({ TerminalSession: () => mockTS }));
jest.mock("../support", () => ({
  getCredentials: jest.fn(() => ({ password: "", username: "", url: "" })),
  attachTerminal: jest.fn()
}));

import { attachTerminal, getCredentials } from "../support";

describe("index page", () => {
  // Very little to test here.
  // See dependent modules for in-depth unit tests.
  it("loads the terminal", async () => {
    await import("../index");
    expect(mockTS.connect).toHaveBeenCalled();
    expect(getCredentials).toHaveBeenCalled();
    expect(attachTerminal).toHaveBeenCalled();
  });
});
