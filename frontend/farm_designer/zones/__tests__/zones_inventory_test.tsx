import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawZones as Zones, ZonesProps, mapStateToProps
} from "../zones_inventory";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<Zones> />", () => {
  const fakeProps = (): ZonesProps => ({
    dispatch: jest.fn(),
  });

  it("renders no zones", () => {
    const wrapper = mount(<Zones {...fakeProps()} />);
    expect(wrapper.text()).toContain("No zones yet.");
  });

  it("changes search term", () => {
    const wrapper = shallow<Zones>(<Zones {...fakeProps()} />);
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
