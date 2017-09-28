import * as React from "react";
import { diagnose, Diagnosis } from "../diagnosis";
import { DiagnosticMessages } from "../diagnostic_messages";
import { render } from "enzyme";

describe("<Diagnosis/>", () => {
  it("renders help text", () => {
    const el = render(<Diagnosis
      botMQTT={true}
      botAPI={true}
      userMQTT={true}
      botFirmware={true} />);
    expect(el.text()).toContain(DiagnosticMessages.OK);
  });

  it("renders help text: Arduino disconnected", () => {
    const el = render(<Diagnosis
      botMQTT={true}
      botAPI={true}
      userMQTT={true}
      botFirmware={false} />);
    expect(el.text()).not.toContain(DiagnosticMessages.OK);
    expect(el.text()).toContain(DiagnosticMessages.ARDUINO_DISCONNECTED);
  });
});

describe("diagnose()", () => {
  function testDiagnosis(msg: string,
    botMQTT: boolean,
    botAPI: boolean,
    userMQTT: boolean,
    botFirmware: boolean) {
    expect(diagnose({ botMQTT, botAPI, userMQTT, botFirmware })).toContain(msg);
  }

  it("explains problems", () => {
    testDiagnosis(DiagnosticMessages.OK, true, true, true, true);
    testDiagnosis(DiagnosticMessages.INACTIVE, true, false, true, true);
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, false, true, true, true);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, true, false, true);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false, true);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, true, false, true);
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, false, false, true, true);
    testDiagnosis(DiagnosticMessages.TOTAL_BREAKAGE, false, false, false, true);
  });
});
