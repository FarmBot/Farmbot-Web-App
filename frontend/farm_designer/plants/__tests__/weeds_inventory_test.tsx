import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawWeeds as Weeds, WeedsProps, mapStateToProps
} from "../weeds_inventory";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<Weeds> />", () => {
  const fakeProps = (): WeedsProps => ({
    dispatch: jest.fn(),
  });

  it("renders no points", () => {
    const wrapper = mount(<Weeds {...fakeProps()} />);
    expect(wrapper.text()).toContain("No weeds yet.");
  });

  it("changes search term", () => {
    const wrapper = shallow<Weeds>(<Weeds {...fakeProps()} />);
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "0" } });
    expect(wrapper.state().searchTerm).toEqual("0");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
