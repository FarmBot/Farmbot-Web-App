import * as React from "react";
import { diagnose, Diagnosis, DiagnosisSaucer } from "../diagnosis";
import { DiagnosticMessages } from "../../../constants";
import { mount } from "enzyme";

describe("<Diagnosis/>", () => {
  it("renders help text", () => {
    const el = mount(<Diagnosis
      userAPI={true}
      userMQTT={true}
      botMQTT={true}
      botAPI={true}
      botFirmware={true} />);
    expect(el.text()).toContain(DiagnosticMessages.OK);
    expect(el.find(".saucer").hasClass("green")).toBeTruthy();
  });

  it("renders diagnosis error color", () => {
    const el = mount(<Diagnosis
      userAPI={true}
      userMQTT={true}
      botMQTT={true}
      botAPI={true}
      botFirmware={false} />);
    expect(el.find(".saucer").hasClass("red")).toBeTruthy();
  });
});

describe("<DiagnosisSaucer />", () => {
  it("renders green", () => {
    const flags = {
      userMQTT: true,
      userAPI: true,
      botMQTT: true,
      botAPI: true,
      botFirmware: true,
    };
    const wrapper = mount(<DiagnosisSaucer {...flags} />);
    expect(wrapper.find(".saucer").hasClass("green")).toBeTruthy();
  });
});

describe("diagnose()", () => {
  function testDiagnosis(msg: string,
    userAPI: boolean,
    userMQTT: boolean,
    botMQTT: boolean,
    botAPI: boolean,
    botFirmware: boolean) {
    expect(diagnose({
      userAPI,
      userMQTT,
      botMQTT,
      botAPI,
      botFirmware
    })).toContain(msg);
  }

  it("explains problems", () => {
    //                               userAPI,userMQ,botMQ,botAPI,botFirmware
    testDiagnosis(DiagnosticMessages.OK, true, true, true, true, true); // 31
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, true, true, true, true, false); // 30
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, false, true, true, true, false); // 14
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, true, true, true, false, false); // 28
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, false, true, true, false, false); // 12
    testDiagnosis(DiagnosticMessages.INACTIVE, true, true, true, false, true); // 29
    testDiagnosis(DiagnosticMessages.INACTIVE, false, true, true, false, true); // 13
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, true, true, false, true, true); // 27
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, false, true, false, true, true); // 11
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, true, true, false, true, false); // 26
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, false, true, false, true, false); // 10
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false, true, true); // 19
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, false, true, true); // 3
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false, true, false); // 18
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, false, true, false); // 2
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, true, false, true); // 21
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, true, false, true); // 5
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, true, false, false); // 20
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, true, false, false); // 4
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, true, true, true); // 23
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, true, true, true); // 7
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, true, true, false); // 22
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, true, true, false); // 6
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false, false, true); // 17
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, false, false, false, true); // 1
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, true, false, false, false, false); // 16
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, false, true, true, true, true); // 15
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, true, true, false, false, true); // 25
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, false, true, false, false, true); // 9
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, true, true, false, false, false); // 24
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, false, true, false, false, false); // 8
    testDiagnosis(DiagnosticMessages.TOTAL_BREAKAGE, false, false, false, false, false); // 0
  });
});
