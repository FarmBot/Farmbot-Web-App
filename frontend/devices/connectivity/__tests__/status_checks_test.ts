import {
  browserToMQTT, botToMQTT, botToAPI, botToFirmware, browserToAPI,
} from "../status_checks";
import moment from "moment";
import { ConnectionStatus } from "../../../connectivity/interfaces";
import { betterMerge } from "../../../util";

describe("botToAPI()", () => {
  it("handles connectivity", () => {
    const result = botToAPI(moment().subtract(4, "minutes").toJSON());
    expect(result.connectionStatus).toBeTruthy();
    expect(result.connectionMsg).toContain("4 minutes ago.");
  });

  it("handles loss of connectivity", () => {
    const result = botToAPI(moment().subtract(4, "days").toJSON());
    expect(result.connectionStatus).toBeFalsy();
    expect(result.connectionMsg).toContain("4 days ago.");
  });

  it("handles unknown connectivity", () => {
    const result = botToAPI(undefined, (new Date()).getTime());
    expect(result.connectionStatus).toBeFalsy();
    expect(result.connectionMsg).toContain("No messages seen yet.");
  });
});

describe("botToMQTT()", () => {
  const DEFAULT_STATE: ConnectionStatus = {
    at: new Date("2017-09-27T07:52:37.003-05:00").getTime(),
    state: "up"
  };
  function stat(input: Partial<ConnectionStatus> = {}): ConnectionStatus {
    return betterMerge(DEFAULT_STATE, input as ConnectionStatus);
  }
  it("handles connectivity", () => {
    const input = stat();
    const result = botToMQTT(input);
    expect(result.connectionStatus).toBeTruthy();
    expect(result.connectionMsg).toContain(" ago");
  });

  it("handles loss of connectivity", () => {
    const result = botToMQTT(undefined);
    expect(result.connectionStatus).toBeFalsy();
    expect(result.connectionMsg).toContain("No recent messages.");
  });
});
const NOW = (new Date()).getTime();
describe("browserToMQTT()", () => {
  it("handles connectivity", () => {
    const output = browserToMQTT({ state: "up", at: NOW });
    expect(output.connectionStatus).toBe(true);
    expect(output.connectionMsg).toContain("a few seconds ago.");
  });

  it("handles unknown connectivity", () => {
    const output = browserToMQTT(undefined);
    expect(output.connectionStatus).toBe(undefined);
    expect(output.connectionMsg).toContain("No recent messages.");
  });

  it("handles lack of connectivity", () => {
    const output = browserToMQTT({ state: "down", at: NOW });
    expect(output.connectionStatus).toBe(false);
    expect(output.connectionMsg).toContain("No recent messages.");
  });
});

describe("botToFirmware()", () => {
  it("handles connectivity", () => {
    const output = botToFirmware("0.0.0.R", "arduino");
    expect(output.connectionStatus).toBe(true);
    expect(output.to).toContain("Arduino");
    expect(output.connectionMsg).toContain("Connected");
  });

  it("returns board name", () => {
    expect(botToFirmware("0.0.0.F", "farmduino").to).toContain("Farmduino");
    expect(botToFirmware("0.0.0.G", "farmduino_k14").to).toContain("Farmduino");
    expect(botToFirmware("0.0.0.E", "express_k10").to).toContain("Farmduino");
  });

  it("board undefined", () => {
    const output = botToFirmware(undefined, undefined);
    expect(output.to).toContain("Farmduino");
  });

  it("shows 'None' firmware selected", () => {
    const output = botToFirmware(undefined, "none");
    expect(output.to).toContain("None");
  });

  it("handles lack of connectivity", () => {
    const output = botToFirmware("Arduino Disconnected!", undefined);
    expect(output.connectionStatus).toBe(false);
    expect(output.to).toContain("Farmduino");
    expect(output.connectionMsg).toContain("Disconnected");
    expect(botToFirmware("STUBFW", undefined).connectionMsg)
      .toContain("Disconnected");
  });
});

describe("browserToAPI()", () => {
  it("handles connectivity", () => {
    const result = browserToAPI({
      state: "up",
      at: (new Date).getTime()
    });
    expect(result.connectionStatus).toBeTruthy();
    expect(result.connectionMsg).toContain("a few seconds ago.");
  });

  it("handles loss of connectivity", () => {
    const result = browserToAPI({
      state: "down",
      at: (new Date).getTime()
    });
    expect(result.connectionStatus).toBeFalsy();
    expect(result.connectionMsg).toContain("a few seconds ago");
  });

  it("handles unknown connectivity", () => {
    const result = browserToAPI(undefined);
    expect(result.connectionStatus).toBeFalsy();
    expect(result.connectionMsg).toContain("No messages seen yet.");
  });
});
