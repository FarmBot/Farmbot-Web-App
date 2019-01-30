import * as React from "react";
import { ExportAccountPanel } from "../components/export_account_panel";
import { mount } from "enzyme";

describe("<ExportAccountPanel/>", () => {
  it("renders", () => {
    const onClick = jest.fn();
    const el = mount(<ExportAccountPanel onClick={onClick} />);
    expect(el.text()).toContain("Send Account Export File (Email)");
    el.find("button").first().simulate("click");
    expect(onClick).toHaveBeenCalled();
  });
});
