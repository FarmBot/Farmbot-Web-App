import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerFarmwareList as DesignerFarmwareList,
  DesignerFarmwareListProps,
  mapStateToProps,
  FarmwareListItem,
  FarmwareListItemProps,
} from "../list";
import {
  fakeFarmware,
} from "../../../__test_support__/fake_farmwares";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFarmwareInstallation,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { SearchField } from "../../../ui/search_field";
import { Actions } from "../../../constants";

describe("<DesignerFarmwareList />", () => {
  const fakeProps = (): DesignerFarmwareListProps => ({
    dispatch: jest.fn(),
    currentFarmware: undefined,
    farmwares: {},
    firstPartyFarmwareNames: ["x"],
  });

  it("renders empty farmware list panel", () => {
    const wrapper = mount(<DesignerFarmwareList {...fakeProps()} />);
    ["no farmware yet", "add a farmware"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders farmware list panel", () => {
    const p = fakeProps();
    p.farmwares = { x: fakeFarmware("x"), y: fakeFarmware("y") };
    const wrapper = mount(<DesignerFarmwareList {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("y");
    expect(wrapper.text().toLowerCase()).not.toContain("x");
  });

  it("changes search term", () => {
    const wrapper = shallow<DesignerFarmwareList>(
      <DesignerFarmwareList {...fakeProps()} />);
    expect(wrapper.state().searchTerm).toEqual("");
    wrapper.find(SearchField).simulate("change", "my farmware");
    expect(wrapper.state().searchTerm).toEqual("my farmware");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const farmware = fakeFarmwareInstallation();
    farmware.body.package = "fake farmware";
    farmware.body.id = 1;
    state.resources = buildResourceIndex([farmware]);
    const props = mapStateToProps(state);
    expect(props.farmwares).toEqual({
      "fake farmware (pending install...)": expect.any(Object)
    });
  });
});

describe("<FarmwareListItem />", () => {
  const fakeProps = (): FarmwareListItemProps => ({
    dispatch: jest.fn(),
    farmwareName: "My Farmware",
  });

  it("renders list item", () => {
    const wrapper = mount(<FarmwareListItem {...fakeProps()} />);
    expect(wrapper.text()).toContain("My Farmware");
  });

  it("navigates", () => {
    const p = fakeProps();
    const wrapper = mount(<FarmwareListItem {...p} />);
    wrapper.simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "My Farmware"
    });
  });
});
