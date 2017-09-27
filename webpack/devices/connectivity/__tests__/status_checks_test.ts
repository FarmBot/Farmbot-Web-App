import { browserToMQTT, botToMQTT, botToAPI } from "../status_checks";
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
    const output = browserToMQTT("localhost", true);
    expect(output.connectionStatus).toBe(true);
    expect(output.children).toContain("Connected to mqtt://localhost");
  });

  it("handles unknown connectivity", () => {
    const output = browserToMQTT("localhost", undefined);
    expect(output.connectionStatus).toBe(undefined);
    expect(output.children).toContain("Unable to connect");
  });

  it("handles lack of connectivity", () => {
    const output = browserToMQTT("localhost", false);
    expect(output.connectionStatus).toBe(false);
    expect(output.children).toContain("Unable to connect");
  });
});
