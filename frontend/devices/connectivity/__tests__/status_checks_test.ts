import {
  browserToMQTT, botToMQTT, botToAPI, botToFirmware, browserToAPI
} from "../status_checks";
import moment from "moment";
import { ConnectionStatus } from "../../../connectivity/interfaces";
import { betterMerge } from "../../../util";

describe("botToAPI()", () => {
  it("handles connectivity", () => {
    const result = botToAPI(moment().subtract(4, "minutes").toJSON());
    expect(result.connectionStatus).toBeTruthy();

    expect(result.children).toContain("Last message seen 4 minutes ago.");
  });

  it("handles loss of connectivity", () => {
    const result = botToAPI(moment().subtract(4, "days").toJSON());
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("Last message seen 4 days ago.");
  });

  it("handles unknown connectivity", () => {
    const result = botToAPI(undefined, moment());
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("No messages seen yet.");
  });
});

describe("botToMQTT()", () => {
  const DEFAULT_STATE: ConnectionStatus = {
    at: "2017-09-27T07:52:37.003-05:00",
    state: "up"
  };
  function stat(input: Partial<ConnectionStatus> = {}): ConnectionStatus {
    return betterMerge(DEFAULT_STATE, input as ConnectionStatus);
  }
  it("handles connectivity", () => {
    const input = stat();
    const result = botToMQTT(input);
    expect(result.connectionStatus).toBeTruthy();
    expect(result.children).toContain("Last message seen ");
    expect(result.children).toContain(" ago");
  });

  it("handles loss of connectivity", () => {
    const result = botToMQTT(undefined);
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("No recent messages.");
  });
});
const NOW = moment().toJSON();
describe("browserToMQTT()", () => {
  it("handles connectivity", () => {
    const output = browserToMQTT({ state: "up", at: NOW });
    expect(output.connectionStatus).toBe(true);
    expect(output.children).toContain("Last message seen a few seconds ago.");
  });

  it("handles unknown connectivity", () => {
    const output = browserToMQTT(undefined);
    expect(output.connectionStatus).toBe(undefined);
    expect(output.children).toContain("No messages seen yet.");
  });

  it("handles lack of connectivity", () => {
    const output = browserToMQTT({ state: "down", at: NOW });
    expect(output.connectionStatus).toBe(false);
    expect(output.children).toContain("Last message seen a few seconds ago.");
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
    expect(botToFirmware("0.0.0.F").to).toContain("Farmduino");
    expect(botToFirmware("0.0.0.G").to).toContain("Farmduino");
    expect(botToFirmware("0.0.0.E").to).toContain("Farmduino");
  });

  it("board undefined", () => {
    const output = botToFirmware(undefined);
    expect(output.to).toContain("Arduino");
  });

  it("handles lack of connectivity", () => {
    const output = botToFirmware("Arduino Disconnected!");
    expect(output.connectionStatus).toBe(false);
    expect(output.children).toContain("Disconnected");
    expect(botToFirmware("STUBFW").children).toContain("Disconnected");
  });
});

describe("browserToAPI()", () => {
  it("handles connectivity", () => {
    const result = browserToAPI({
      state: "up",
      at: moment().toISOString()
    });
    expect(result.connectionStatus).toBeTruthy();
    expect(result.children).toContain("Last message seen a few seconds ago.");
  });

  it("handles loss of connectivity", () => {
    const result = browserToAPI({
      state: "down",
      at: moment().toISOString()
    });
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("Last message seen a few seconds ago");
  });

  it("handles unknown connectivity", () => {
    const result = browserToAPI(undefined);
    expect(result.connectionStatus).toBeFalsy();
    expect(result.children).toContain("No messages seen yet.");
  });
});
