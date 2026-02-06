import mqtt from "mqtt";
import * as support from "../support";

describe("index page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as unknown as { terminal_session?: unknown }).terminal_session;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("loads the terminal", async () => {
    const client = {
      once: jest.fn((_: string, cb: () => void) => cb()),
      subscribe: jest.fn(),
      on: jest.fn(),
      publish: jest.fn(),
    };
    const credentials = { password: "", username: "", url: "ws://example" };
    const terminal = { onKey: jest.fn(), write: jest.fn() };

    const connectSpy = jest.spyOn(mqtt, "connect")
      .mockReturnValue(client as unknown as ReturnType<typeof mqtt.connect>);
    const getCredentialsSpy =
      jest.spyOn(support, "getCredentials").mockReturnValue(credentials);
    const attachTerminalSpy = jest.spyOn(support, "attachTerminal")
      .mockReturnValue(terminal as unknown as ReturnType<typeof support.attachTerminal>);

    await import("../index");

    expect(getCredentialsSpy).toHaveBeenCalled();
    expect(attachTerminalSpy).toHaveBeenCalled();
    expect(connectSpy).toHaveBeenCalledWith(credentials.url, {
      username: credentials.username,
      password: credentials.password,
    });
    expect(client.once).toHaveBeenCalledWith("connect", expect.any(Function));
    expect(client.subscribe).toHaveBeenCalledWith("bot//terminal_output");
    expect(terminal.onKey).toHaveBeenCalledWith(expect.any(Function));
  });
});
