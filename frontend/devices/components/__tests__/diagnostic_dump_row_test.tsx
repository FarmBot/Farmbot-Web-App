jest.mock("../../../api/crud", () => {
  return { destroy: jest.fn() };
});

import * as React from "react";
import { mount } from "enzyme";
import { DiagnosticDumpRow } from "../diagnostic_dump_row";
import {
  fakeDiagnosticDump
} from "../../../__test_support__/fake_state/resources";
import { destroy } from "../../../api/crud";

describe("<DiagnosticDumpRow/>", () => {
  it("renders a single diagnostic dump", () => {
    const dispatch = jest.fn();
    const diag = fakeDiagnosticDump();
    diag.body.ticket_identifier = "0000";
    const el = mount(<DiagnosticDumpRow dispatch={dispatch} diag={diag} />);
    expect(el.text()).toContain("0000");
    el.find("button.red").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(diag.uuid);
  });
});
