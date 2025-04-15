import React from "react";
import {
  getDiagnosisCode, diagnosisMessage, Diagnosis, DiagnosisSaucer,
  DiagnosisProps, DiagnosisSaucerProps,
} from "../diagnosis";
import { DiagnosticMessages } from "../../../constants";
import { mount } from "enzyme";
import { fireEvent, render, screen } from "@testing-library/react";
import { Path } from "../../../internal_urls";

describe("<Diagnosis/>", () => {
  const fakeProps = (): DiagnosisProps => ({
    statusFlags: {
      userAPI: true,
      userMQTT: true,
      botMQTT: true,
      botAPI: true,
      botFirmware: true,
    },
    dispatch: jest.fn(),
  });

  it("renders help text", () => {
    const el = mount(<Diagnosis {...fakeProps()} />);
    expect(el.text()).toContain(DiagnosticMessages.OK);
    expect(el.find(".saucer").hasClass("green")).toBeTruthy();
  });

  it("renders diagnosis error color", () => {
    const p = fakeProps();
    p.statusFlags.botFirmware = false;
    const el = mount(<Diagnosis {...p} />);
    expect(el.find(".saucer").hasClass("red")).toBeTruthy();
  });

  it("navigates on click", () => {
    render(<Diagnosis {...fakeProps()} />);
    const link = screen.getByText("upgrade FarmBot OS");
    fireEvent.click(link);
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("farmbot_os"));
  });
});

describe("<DiagnosisSaucer />", () => {
  const fakeProps = (): DiagnosisSaucerProps => ({
    userAPI: true,
    userMQTT: true,
    botMQTT: true,
    botAPI: true,
    botFirmware: true,
  });

  it("renders green", () => {
    const wrapper = mount(<DiagnosisSaucer {...fakeProps()} />);
    expect(wrapper.find(".saucer").hasClass("green")).toBeTruthy();
  });

  it("renders sync status", () => {
    const p = fakeProps();
    p.syncStatus = "syncing";
    const wrapper = mount(<DiagnosisSaucer {...p} />);
    expect(wrapper.html()).toContain("fa-spinner");
  });
});

describe("getDiagnosisCode()", () => {
  function testDiagnosis(code: number,
    userAPI: boolean,
    userMQTT: boolean,
    botMQTT: boolean,
    botAPI: boolean,
    botFirmware: boolean) {
    expect(getDiagnosisCode({
      userAPI,
      userMQTT,
      botMQTT,
      botAPI,
      botFirmware
    })).toEqual(code);
  }

  it("returns correct code", () => {
    //                userAPI,userMQ,botMQ,botAPI,botFirmware
    testDiagnosis(31, true, true, true, true, true);
    testDiagnosis(30, true, true, true, true, false);
    testDiagnosis(14, false, true, true, true, false);
    testDiagnosis(28, true, true, true, false, false);
    testDiagnosis(12, false, true, true, false, false);
    testDiagnosis(29, true, true, true, false, true);
    testDiagnosis(13, false, true, true, false, true);
    testDiagnosis(27, true, true, false, true, true);
    testDiagnosis(11, false, true, false, true, true);
    testDiagnosis(26, true, true, false, true, false);
    testDiagnosis(10, false, true, false, true, false);
    testDiagnosis(19, true, false, false, true, true);
    testDiagnosis(3, false, false, false, true, true);
    testDiagnosis(18, true, false, false, true, false);
    testDiagnosis(2, false, false, false, true, false);
    testDiagnosis(21, true, false, true, false, true);
    testDiagnosis(5, false, false, true, false, true);
    testDiagnosis(20, true, false, true, false, false);
    testDiagnosis(4, false, false, true, false, false);
    testDiagnosis(23, true, false, true, true, true);
    testDiagnosis(7, false, false, true, true, true);
    testDiagnosis(22, true, false, true, true, false);
    testDiagnosis(6, false, false, true, true, false);
    testDiagnosis(17, true, false, false, false, true);
    testDiagnosis(1, false, false, false, false, true);
    testDiagnosis(16, true, false, false, false, false);
    testDiagnosis(15, false, true, true, true, true);
    testDiagnosis(25, true, true, false, false, true);
    testDiagnosis(9, false, true, false, false, true);
    testDiagnosis(24, true, true, false, false, false);
    testDiagnosis(8, false, true, false, false, false);
    testDiagnosis(0, false, false, false, false, false);
  });
});

describe("diagnosisMessage()", () => {
  function testDiagnosis(msg: string, code: number) {
    expect(diagnosisMessage(code)).toContain(msg);
  }

  it("explains problems", () => {
    testDiagnosis(DiagnosticMessages.OK, 31);
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, 30);
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, 14);
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, 28);
    testDiagnosis(DiagnosticMessages.ARDUINO_DISCONNECTED, 12);
    testDiagnosis(DiagnosticMessages.INACTIVE, 29);
    testDiagnosis(DiagnosticMessages.INACTIVE, 13);
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, 27);
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, 11);
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, 26);
    testDiagnosis(DiagnosticMessages.REMOTE_FIREWALL, 10);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 19);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 3);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 18);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 2);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 21);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 5);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 20);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 4);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 23);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 7);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 22);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 6);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 17);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 1);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 16);
    testDiagnosis(DiagnosticMessages.NO_WS_AVAILABLE, 15);
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, 25);
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, 9);
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, 24);
    testDiagnosis(DiagnosticMessages.WIFI_OR_CONFIG, 8);
    testDiagnosis(DiagnosticMessages.TOTAL_BREAKAGE, 0);
    testDiagnosis(DiagnosticMessages.MISC, -1);
  });
});
