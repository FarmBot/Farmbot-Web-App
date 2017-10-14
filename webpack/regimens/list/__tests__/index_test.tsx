import * as React from "react";
import { mount, shallow } from "enzyme";
import { RegimensList } from "../index";
import { RegimensListProps } from "../../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";

describe("<RegimensList />", () => {
  function fakeProps(): RegimensListProps {
    const regimen = fakeRegimen();
    regimen.body.name = "Fake Regimen";
    return {
      dispatch: jest.fn(),
      regimens: [regimen, regimen],
      regimen: undefined
    };
  }
  it("renders", () => {
    const wrapper = mount(<RegimensList {...fakeProps() } />);
    expect(wrapper.text()).toContain("Regimens");
    expect(wrapper.text()).toContain("Fake Regimen Fake Regimen");
  });

  it("sets search term", () => {
    const wrapper = shallow(<RegimensList {...fakeProps() } />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "term" } });
    expect(wrapper.state().searchTerm).toEqual("term");
  });
});
