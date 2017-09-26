import { browserToMQTT } from "../status_checks";

describe("botToAPI()", () => {
  it("handles connectivity");
  it("handles unknown connectivity");
  it("handles loss of connectivity");
});

describe("botToMQTT()", () => {
  it("handles connectivity");
  it("handles unknown connectivity");
  it("handles loss of connectivity");
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
