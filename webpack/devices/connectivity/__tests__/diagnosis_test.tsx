import * as React from "react";
import { diagnose, Diagnosis } from "../diagnosis";
import { DiagnosticMessages } from "../diagnostic_messages";
import { render } from "enzyme";

describe("<Diagnosis/>", () => {
  it("renders help text", () => {
    const el = render(<Diagnosis
      botMQTT={true}
      botAPI={true}
      userMQTT={true} />);
    expect(el.text()).toContain(DiagnosticMessages.OK);
  });
});

describe("diagnose()", () => {
  function testDiagnosis(msg: string,
    botMQTT: boolean,
    botAPI: boolean,
    userMQTT: boolean) {
    expect(diagnose({ botMQTT, botAPI, userMQTT })).toContain(msg);
  }

  it("explains problems", () => {
    testDiagnosis(DiagnosticMessages.OK, true, true, true);
    testDiagnosis(DiagnosticMessages.INACTIVE, true, false, true);
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, false, true, true);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, true, false);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, true, false);
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, false, false, true);
    testDiagnosis(DiagnosticMessages.TOTAL_BREAKAGE, false, false, false);
  });
});
