import {
  browserToMQTT, botToMQTT, botToAPI, botToFirmware, browserToAPI
} from "../status_checks";
import * as moment from "moment";

describe("botToAPI()", () => {
  it("handles connectivity", () => {
    const result = botToAPI(moment().subtract(4, "minutes"), moment());
    expect(result.connectionStatus).toBeTruthy();
    expect(result.children).toContain("Last seen 4 minutes ago.");
  });

  it("handles loss of connectivity", () => {
    const result = botToAPI(moment().subtract(4, "days"), moment());
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("Last seen 4 days ago.");
  });

  it("handles unknown connectivity", () => {
    const result = botToAPI(undefined, moment());
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("not seen messages from FarmBot yet.");
  });
});

describe("botToMQTT()", () => {
  it("handles connectivity", () => {
    const result = botToMQTT("\"2017-09-27T07:52:37.003-05:00\"");
    expect(result.connectionStatus).toBeTruthy();
    expect(result.children).toContain("Connected ");
    expect(result.children).toContain(" ago");
  });

  it("handles loss of connectivity", () => {
    const result = botToMQTT(undefined);
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("not seeing any");
  });
});

describe("browserToMQTT()", () => {
  it("handles connectivity", () => {
    const output = browserToMQTT(true);
    expect(output.connectionStatus).toBe(true);
    expect(output.children).toContain("Connected");
  });

  it("handles unknown connectivity", () => {
    const output = browserToMQTT(undefined);
    expect(output.connectionStatus).toBe(undefined);
    expect(output.children).toContain("Unable to connect");
  });

  it("handles lack of connectivity", () => {
    const output = browserToMQTT(false);
    expect(output.connectionStatus).toBe(false);
    expect(output.children).toContain("Unable to connect");
  });
});

describe("botToFirmware()", () => {
  it("handles connectivity", () => {
    const output = botToFirmware("0.0.0.R");
    expect(output.connectionStatus).toBe(true);
    expect(output.to).toContain("Arduino");
    expect(output.children).toContain("Connected");
  });

  it("returns board name", () => {
    const output = botToFirmware("0.0.0.F");
    expect(output.to).toContain("Farmduino");
  });

  it("board undefined", () => {
    const output = botToFirmware(undefined);
    expect(output.to).toContain("Arduino");
  });

  it("handles lack of connectivity", () => {
    const output = botToFirmware("Arduino Disconnected!");
    expect(output.connectionStatus).toBe(false);
    expect(output.children).toContain("Disconnected");
  });
});

describe("browserToAPI()", () => {
  it("handles connectivity", () => {
    const result = browserToAPI({
      state: "up",
      at: moment().toISOString()
    });
    expect(result.connectionStatus).toBeTruthy();
    expect(result.children).toContain("Last seen a few seconds ago");
  });

  it("handles loss of connectivity", () => {
    const result = browserToAPI({
      state: "down",
      at: moment().toISOString()
    });
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("Last seen a few seconds ago");
  });

  it("handles unknown connectivity", () => {
    const result = browserToAPI(undefined);
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("Waiting for response from network");
  });
});
