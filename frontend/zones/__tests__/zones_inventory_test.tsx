jest.mock("../../api/crud", () => ({ initSaveGetId: jest.fn() }));

import React, { act } from "react";
import { mount, shallow } from "enzyme";
import {
  RawZones as Zones, ZonesProps, mapStateToProps,
} from "../zones_inventory";
import { fakeState } from "../../__test_support__/fake_state";
import { fakePointGroup } from "../../__test_support__/fake_state/resources";
import { initSaveGetId } from "../../api/crud";
import { DesignerPanelTop } from "../../farm_designer/designer_panel";
import { SearchField } from "../../ui/search_field";
import { Path } from "../../internal_urls";

describe("<Zones> />", () => {
  const fakeProps = (): ZonesProps => ({
    dispatch: jest.fn(),
    zones: [],
    allPoints: [],
  });

  it("renders no zones", () => {
    const wrapper = mount(<Zones {...fakeProps()} />);
    expect(wrapper.text()).toContain("No zones yet.");
  });

  it("navigates to zone info", () => {
    const p = fakeProps();
    p.zones = [fakePointGroup()];
    p.zones[0].body.id = 1;
    const wrapper = mount(<Zones {...p} />);
    wrapper.find(".group-search-item").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.zones(1));
  });

  it("navigates to unsaved zone", () => {
    const p = fakeProps();
    p.zones = [fakePointGroup()];
    p.zones[0].body.id = 0;
    const wrapper = mount(<Zones {...p} />);
    wrapper.find(".group-search-item").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.zones(0));
  });

  it("filters points", () => {
    const p = fakeProps();
    p.zones = [fakePointGroup(), fakePointGroup()];
    p.zones[0].body.name = "zone 0";
    p.zones[1].body.name = "zone 1";
    const wrapper = mount(<Zones {...p} />);
    act(() => wrapper.find(SearchField).props().onChange("0"));
    expect(wrapper.text()).not.toContain("zone 1");
  });

  it("creates new zone", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve(1));
    const wrapper = shallow(<Zones {...p} />);
    await wrapper.find(DesignerPanelTop).simulate("click");
    expect(initSaveGetId).toHaveBeenCalledWith("PointGroup", {
      name: "Untitled Zone", point_ids: []
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.zones(1));
  });

  it("handles zone creation error", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject());
    const wrapper = shallow(<Zones {...p} />);
    await wrapper.find(DesignerPanelTop).simulate("click");
    expect(initSaveGetId).toHaveBeenCalledWith("PointGroup", {
      name: "Untitled Zone", point_ids: []
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
