import React from "react";
import { shallow } from "enzyme";
import { DEMO_LOADING, TryFarmbot } from "../try_farmbot";

describe("<TryFarmbot />", () => {
  it("renders OK", () => {
    const tfb = new TryFarmbot({});
    tfb.requestAccount = jest.fn();
    expect(tfb.render()).toEqual(DEMO_LOADING);
    tfb.componentDidMount();
    expect(tfb.requestAccount).toHaveBeenCalled();
  });

  it("renders errors", () => {
    const tfb = new TryFarmbot({});
    tfb.no = jest.fn();
    tfb.state.error = new Error("Testing");
    tfb.render();
    expect(tfb.no).toHaveBeenCalled();
  });

  it("renders", () => {
    console.error = jest.fn();
    const wrapper = shallow(<TryFarmbot />);
    expect(wrapper.text().toLowerCase()).toContain("loading");
  });
});
