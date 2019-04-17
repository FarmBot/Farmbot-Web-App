import * as React from "react";
import { render } from "enzyme";
import { SendDiagnosticReport, DiagReportProps } from "../send_diagnostic_report";
import { fakeDiagnosticDump } from "../../../__test_support__/fake_state/resources";

describe("<SendDiagnosticReport/>", () => {
  const fakeProps = (): DiagReportProps => ({
    dispatch: jest.fn(),
    diagnostics: [fakeDiagnosticDump()],
    expanded: true,
    shouldDisplay: jest.fn(() => true),
    botOnline: true,
  });

  it("renders", () => {
    const p = fakeProps();
    p.shouldDisplay = jest.fn(() => true);
    const wrapper = render(<SendDiagnosticReport {...p} />);
    expect(wrapper.text()).toContain("DIAGNOSTIC CHECK");
    expect(p.shouldDisplay).toHaveBeenCalled();
  });

  it("doesn't render", () => {
    const p = fakeProps();
    p.shouldDisplay = jest.fn(() => false);
    const wrapper = render(<SendDiagnosticReport {...p} />);
    expect(wrapper.text()).toEqual("");
    expect(p.shouldDisplay).toHaveBeenCalled();
  });
});
