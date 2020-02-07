jest.mock("../../actions", () => ({ editRegimen: jest.fn() }));

import * as React from "react";
import { shallow } from "enzyme";
import { write, RegimenNameInput } from "../regimen_name_input";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { editRegimen } from "../../actions";
import { inputEvent } from "../../../__test_support__/fake_html_events";

const fakeProps = () => ({ regimen: fakeRegimen(), dispatch: jest.fn() });

describe("write()", () => {
  it("calls dispatch", () => {
    const p = fakeProps();
    write(p)(inputEvent("foo"));
    expect(editRegimen).toHaveBeenCalledWith(p.regimen, { name: "foo" });
  });
});

describe("<RegimenNameInput />", () => {
  it("changes color", () => {
    const p = fakeProps();
    const wrapper = shallow(<RegimenNameInput {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(editRegimen).toHaveBeenCalledWith(p.regimen, { color: "red" });
  });
});
