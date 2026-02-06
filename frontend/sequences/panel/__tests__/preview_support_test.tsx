import React from "react";
import { shallow } from "enzyme";
import {
  License,
  LicenseProps,
  mapStateToProps,
} from "../preview_support";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeState } from "../../../__test_support__/fake_state";
import * as crud from "../../../api/crud";
import {
  fakeSequence, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import { getWebAppConfig } from "../../../resources/getters";

let editSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
});

afterEach(() => {
  editSpy.mockRestore();
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.show_pins = true;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(getWebAppConfig(props.resources)?.body.show_pins).toEqual(true);
  });
});

describe("<License />", () => {
  const fakeProps = (): LicenseProps => ({
    collapsed: false,
    toggle: jest.fn(),
    sequence: fakeSequence(),
    dispatch: jest.fn(),
  });

  it("changes input", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = undefined;
    p.sequence.body.forked = false;
    p.sequence.body.sequence_versions = [1];
    const wrapper = shallow(<License {...p} />);
    wrapper.find("input").simulate("change", { currentTarget: { value: "c" } });
    expect(crud.edit).toHaveBeenCalledWith(p.sequence, { copyright: "c" });
  });
});
