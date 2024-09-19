const mockTerminal: Pick<Terminal, "open" | "resize"> = {
  open: jest.fn(),
  resize: jest.fn(),
};

jest.mock("@xterm/xterm", () => {
  return {
    Terminal: function () {
      return mockTerminal;
    }
  };
});

import { Terminal } from "@xterm/xterm";
import { attachTerminal, getCredentials } from "../support";

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
    document.body.appendChild(root);
    const terminal = attachTerminal();
    expect(terminal).toBe(mockTerminal);
    expect(terminal.open).toHaveBeenCalledWith(root);
    root.remove();
  });

  it("ignores the DOM if missing", () => {
    expect(document.getElementById("root")).toBeFalsy();
    const terminal = attachTerminal();
    expect(terminal).toBe(mockTerminal);
  });
});
