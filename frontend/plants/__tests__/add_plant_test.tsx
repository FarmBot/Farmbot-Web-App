import React from "react";
import { mount } from "enzyme";
import {
  RawAddPlant as AddPlant, AddPlantProps, mapStateToProps,
} from "../add_plant";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { mockDispatch } from "../../__test_support__/fake_dispatch";

describe("<AddPlant />", () => {
  const fakeProps = (): AddPlantProps => {
    const designer = fakeDesignerState();
    return {
      designer,
      dispatch: jest.fn(),
      xy_swap: false,
      botPosition: { x: undefined, y: undefined, z: undefined },
    };
  };

  it("renders", () => {
    console.debug = jest.fn();
    location.pathname = Path.mock(Path.cropSearch("mint/add"));
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), fakeState);
    const wrapper = mount(<AddPlant {...p} />);
    expect(wrapper.text()).toContain("Mint");
    const img = wrapper.find("img");
    expect(img).toBeDefined();
    expect(img.props().src).toEqual("/crops/icons/mint.avif");
  });
});

describe("mapStateToProps", () => {
  it("maps state to props", () => {
    const state = fakeState();
    const results = mapStateToProps(state);
    expect(results.xy_swap).toEqual(false);
  });

  it("returns xy_swap equals true", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.xy_swap = true;
    state.resources = buildResourceIndex([webAppConfig]);
    const results = mapStateToProps(state);
    expect(results.xy_swap).toEqual(true);
  });
});
