let mockPath = "/app/designer/zones/1";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { push: jest.fn() }
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditZone as EditZone, EditZoneProps, mapStateToProps,
} from "../edit_zone";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakePointGroup } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { save, edit } from "../../../api/crud";

describe("<EditZone />", () => {
  const fakeProps = (): EditZoneProps => ({
    dispatch: jest.fn(),
    findZone: () => undefined,
  });

  it("redirects", () => {
    mockPath = "/app/designer/zones";
    const wrapper = mount(<EditZone {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
  });

  it("renders", () => {
    mockPath = "/app/designer/zones/1";
    const p = fakeProps();
    p.findZone = () => fakePointGroup();
    const wrapper = mount(<EditZone {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("edit");
  });

  it("changes name", () => {
    mockPath = "/app/designer/zones/1";
    const p = fakeProps();
    const group = fakePointGroup();
    p.findZone = () => group;
    const wrapper = shallow(<EditZone {...p} />);
    wrapper.find("input").first().simulate("blur", {
      currentTarget: { value: "new name" }
    });
    expect(edit).toHaveBeenCalledWith(group, { name: "new name" });
    expect(save).toHaveBeenCalledWith(group.uuid);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakePointGroup()]);
    const props = mapStateToProps(state);
    expect(props.findZone(1)).toEqual(undefined);
  });
});
