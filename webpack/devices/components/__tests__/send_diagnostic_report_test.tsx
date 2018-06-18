import * as React from "react";
import { render } from "enzyme";
import { SendDiagnosticReport } from "../send_diagnostic_report";

describe("<SendDiagnosticReport/>", () => {
  it("renders", () => {
    const el = render(<SendDiagnosticReport />);
    expect(el.text()).toContain("DIAGNOSTIC CHECK");
  });
})
