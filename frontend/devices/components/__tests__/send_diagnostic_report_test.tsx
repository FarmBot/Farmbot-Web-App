import * as React from "react";
import { render } from "enzyme";
import { SendDiagnosticReport, DiagReportProps } from "../send_diagnostic_report";
import { fakeDiagnosticDump } from "../../../__test_support__/fake_state/resources";

describe("<SendDiagnosticReport/>", () => {
  const fakeProps = (): DiagReportProps => ({
    dispatch: jest.fn(),
    diagnostics: [fakeDiagnosticDump()],
    expanded: true,
    botOnline: true,
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = render(<SendDiagnosticReport {...p} />);
    expect(wrapper.text()).toContain("DIAGNOSTIC CHECK");
  });
});
