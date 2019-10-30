jest.mock("../../../api/crud", () => ({ edit: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { PathInfoBar, nn, NNPath, PathInfoBarProps } from "../paths";
import {
  fakePlant, fakePointGroup
} from "../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps
} from "../../../__test_support__/map_transform_props";
import { Actions } from "../../../constants";
import { edit } from "../../../api/crud";
import { error } from "../../../toast/toast";

describe("<PathInfoBar />", () => {
  const fakeProps = (): PathInfoBarProps => ({
    sortTypeKey: "random",
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pathData: { random: 123 },
  });

  it("hovers path", () => {
    const p = fakeProps();
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TRY_SORT_TYPE, payload: "random"
    });
  });

  it("unhovers path", () => {
    const p = fakeProps();
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TRY_SORT_TYPE, payload: undefined
    });
  });

  it("selects path", () => {
    const p = fakeProps();
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("click");
    expect(edit).toHaveBeenCalledWith(p.group, { sort_type: "random" });
  });

  it("selects new path", () => {
    const p = fakeProps();
    p.sortTypeKey = "nn";
    const wrapper = shallow(<PathInfoBar {...p} />);
    wrapper.simulate("click");
    expect(edit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Not supported yet.");
  });
});

describe("nearest neighbor algorithm", () => {
  it("returns optimized array", () => {
    const p1 = fakePlant();
    p1.body.x = 100;
    p1.body.y = 100;
    const p2 = fakePlant();
    p2.body.x = 200;
    p2.body.y = 200;
    const p3 = fakePlant();
    p3.body.x = 175;
    p3.body.y = 1000;
    const p4 = fakePlant();
    p4.body.x = 1000;
    p4.body.y = 150;
    const points = nn([p4, p2, p3, p1]);
    expect(points).toEqual([p1, p2, p3, p4]);
  });
});

describe("<NNPath />", () => {
  const fakeProps = () => ({
    plants: [],
    mapTransformProps: fakeMapTransformProps(),
  });

  it("doesn't render optimized path", () => {
    const wrapper = mount(<NNPath {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<g></g>");
  });

  it("renders optimized path", () => {
    localStorage.setItem("try_it", "ok");
    const wrapper = mount(<NNPath {...fakeProps()} />);
    expect(wrapper.html()).not.toEqual("<g></g>");
  });
});
