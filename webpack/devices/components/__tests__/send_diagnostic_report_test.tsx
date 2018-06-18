import * as React from "react";
import { render } from "enzyme";
import { SendDiagnosticReport } from "../send_diagnostic_report";
import { fakeDiagnosticDump } from "../../../__test_support__/fake_state/resources";

describe("<SendDiagnosticReport/>", () => {
  it("renders", () => {
    const dispatch = jest.fn();
    const shouldDisplay = jest.fn(() => true);
    const fake = fakeDiagnosticDump();
    const el = render(<SendDiagnosticReport
      diagnostics={[fake]}
      expanded={true}
      dispatch={dispatch}
      shouldDisplay={shouldDisplay} />);
    expect(el.text()).toContain("DIAGNOSTIC CHECK");
  });
});
