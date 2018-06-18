import * as React from "react";
import { render } from "enzyme";
import { SendDiagnosticReport } from "../send_diagnostic_report";

describe("<SendDiagnosticReport/>", () => {
  it("renders", () => {
    const dispatch = jest.fn();
    const shouldDisplay = jest.fn();
    const el = render(<SendDiagnosticReport
      expanded={true}
      dispatch={dispatch}
      shouldDisplay={shouldDisplay} />);
    expect(el.text()).toContain("DIAGNOSTIC CHECK");
  });
})
