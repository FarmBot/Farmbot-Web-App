import * as React from "react";
import { mount, shallow } from "enzyme";
import { RegimensList } from "../index";
import { RegimensListProps } from "../../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";

describe("<RegimensList />", () => {
  function fakeProps(): RegimensListProps {
    const regimen1 = fakeRegimen();
    regimen1.body.name = "Fake Regimen 1";
    const regimen2 = fakeRegimen();
    regimen2.body.name = "Fake Regimen 2";
    return {
      dispatch: jest.fn(),
      regimens: [regimen1, regimen2],
      regimen: undefined
    };
  }
  it("renders", () => {
    const wrapper = mount(<RegimensList {...fakeProps()} />);
    ["Fake Regimen 1", "Fake Regimen 2"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("sets search term", () => {
    const wrapper = shallow<RegimensList>(<RegimensList {...fakeProps()} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "term" } });
    expect(wrapper.instance().state.searchTerm).toEqual("term");
  });
});
