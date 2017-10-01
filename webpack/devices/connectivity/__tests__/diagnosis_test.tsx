import * as React from "react";
import { diagnose, Diagnosis } from "../diagnosis";
import { DiagnosticMessages } from "../diagnostic_messages";
import { mount } from "enzyme";

describe("<Diagnosis/>", () => {
  it("renders help text", () => {
    const el = mount(<Diagnosis
      userMQTT={true}
      userAPI={true}
      botMQTT={true}
      botAPI={true}
      botFirmware={true} />);
    expect(el.text()).toContain(DiagnosticMessages.OK);
    expect(el.find(".saucer").hasClass("green")).toBeTruthy();
  });

  it("renders diagnosis error color", () => {
    const el = mount(<Diagnosis
      userMQTT={true}
      userAPI={true}
      botMQTT={true}
      botAPI={true}
      botFirmware={false} />);
    expect(el.find(".saucer").hasClass("red")).toBeTruthy();
  });
});

describe("diagnose()", () => {
  function testDiagnosis(msg: string,
    userAPI: boolean,
    botMQTT: boolean,
    botAPI: boolean,
    userMQTT: boolean,
    botFirmware: boolean) {
    expect(diagnose({
      botMQTT,
      botAPI,
      userMQTT,
      botFirmware,
      userAPI
    })).toContain(msg);
  }

  it("explains problems", () => {
    testDiagnosis(DiagnosticMessages.OK, true, true, true, true, true); // 15
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, true, true, true, true, false); // 14
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, true, true, false, true, false); // 10
    testDiagnosis(DiagnosticMessages.INACTIVE, true, true, false, true, true); // 11
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, true, false, true, true, true); // 7
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, true, false, true, true, false); // 6
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, true, false, true); // 5
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, true, false, false); // 4
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, true, false, false, true); // 9
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, true, false, false, false); // 8
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, true, true, false, true); // 13
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, true, true, false, false); // 12
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false, false, true); // 1
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, true, false, false, true, true); // 3
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, true, false, false, true, false); // 2
    testDiagnosis(DiagnosticMessages.TOTAL_BREAKAGE, false, false, false, false, false); // 0
  });
});
