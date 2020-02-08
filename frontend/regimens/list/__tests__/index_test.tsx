import * as React from "react";
import { mount } from "enzyme";
import { RegimensList } from "../index";
import { RegimensListProps } from "../../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { inputEvent } from "../../../__test_support__/fake_html_events";

describe("<RegimensList />", () => {
  function fakeProps(): RegimensListProps {
    const regimen1 = fakeRegimen();
    regimen1.body.name = "Fake Regimen 1";
    const regimen2 = fakeRegimen();
    regimen2.body.name = "Fake Regimen 2";
    return {
      dispatch: jest.fn(),
      regimens: [regimen1, regimen2],
      regimen: undefined,
      usageStats: {}
    };
  }
  it("renders", () => {
    const wrapper = mount(<RegimensList {...fakeProps()} />);
    ["Fake Regimen 1", "Fake Regimen 2"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("sets search term", () => {
    const wrapper = mount<RegimensList>(<RegimensList {...fakeProps()} />);
    wrapper.instance().onChange(inputEvent("term"));
    expect(wrapper.state().searchTerm).toEqual("term");
  });
});
