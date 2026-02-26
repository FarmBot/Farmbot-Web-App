import * as xterm from "@xterm/xterm";
import { attachTerminal, getCredentials } from "../support";

const mockTerminal = {
  open: jest.fn(),
  resize: jest.fn(),
};
let originalAssign: Location["assign"];

beforeEach(() => {
  jest.clearAllMocks();
  originalAssign = window.location.assign;
  Object.defineProperty(window.location, "assign", {
    configurable: true,
    value: jest.fn(),
  });
  localStorage.clear();
  document.querySelectorAll("#root").forEach(root => root.remove());
  jest.spyOn(xterm, "Terminal").mockImplementation(() => mockTerminal as never);
});

afterEach(() => {
  Object.defineProperty(window.location, "assign", {
    configurable: true,
    value: originalAssign,
  });
  document.querySelectorAll("#root").forEach(root => root.remove());
});

describe("getCredentials", () => {
  it("returns credentials whe possible", () => {
    const session = {
      token: {
        encoded: "password456",
        unencoded: {
          mqtt_ws: "ws://localhost:4567/x",
          bot: "device_37"
        }
      }
    };
    localStorage.setItem("session", JSON.stringify(session));
    const result = getCredentials();
    expect(result.password).toEqual(session.token.encoded);
    expect(result.username).toEqual(session.token.unencoded.bot);
    expect(result.url).toEqual(session.token.unencoded.mqtt_ws);
  });

  it("redirects to home if no credentials are loaded", () => {
    localStorage.clear();
    getCredentials();
    expect(window.location.assign).toHaveBeenCalled();
  });
});

describe("attachTerminal", () => {
  it("attaches to the DOM if possible", () => {
    const root = document.createElement("DIV");
    root.id = "root";
    const getByIdSpy = jest.spyOn(document, "getElementById")
      .mockImplementation(id => id === "root" ? root : undefined);
    const terminal = attachTerminal();
    expect(terminal).toBe(mockTerminal);
    expect(terminal.open).toHaveBeenCalledWith(root);
    getByIdSpy.mockRestore();
  });

  it("ignores the DOM if missing", () => {
    const getByIdSpy = jest.spyOn(document, "getElementById")
      .mockImplementation(() => undefined);
    const terminal = attachTerminal();
    expect(terminal).toBe(mockTerminal);
    expect(terminal.open).not.toHaveBeenCalled();
    getByIdSpy.mockRestore();
  });
});
