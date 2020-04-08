import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawWeeds as Weeds, WeedsProps, mapStateToProps,
} from "../weeds_inventory";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeWeed } from "../../../__test_support__/fake_state/resources";

describe("<Weeds> />", () => {
  const fakeProps = (): WeedsProps => ({
    weeds: [],
    dispatch: jest.fn(),
    hoveredPoint: undefined,
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

  it("filters points", () => {
    const p = fakeProps();
    p.weeds = [fakeWeed(), fakeWeed()];
    p.weeds[0].body.name = "weed 0";
    p.weeds[1].body.name = "weed 1";
    const wrapper = mount(<Weeds {...p} />);
    wrapper.setState({ searchTerm: "0" });
    expect(wrapper.text()).toContain("weed 0");
    expect(wrapper.text()).not.toContain("weed 1");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
