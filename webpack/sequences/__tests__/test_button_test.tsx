const mockDevice = { execSequence: jest.fn(() => Promise.resolve()) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

let mockHasParameters = false;
jest.mock("../locals_list/is_parameterized", () => ({
  isParameterized: () => mockHasParameters
}));

jest.mock("../../ui/filter_search", () => ({
  FilterSearch: () => <div />
}));

jest.mock("@blueprintjs/core", () => ({
  Popover: (props: { children: JSX.Element }) => <div>{props.children}</div>,
}));

import * as React from "react";
import { TestButton, TestBtnProps, setMenuOpen } from "../test_button";
import {
  TaggedSequence, SpecialStatus, VariableDeclaration, ParameterDeclaration
} from "farmbot";
import { mount } from "enzyme";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { warning } from "farmbot-toastr";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { SequenceMeta } from "../../resources/sequence_meta";
import { clickButton } from "../../__test_support__/helpers";

describe("<TestButton/>", () => {
  function fakeSequence(): TaggedSequence {
    return {
      "kind": "Sequence",
      "specialStatus": SpecialStatus.SAVED,
      "body": {
        "name": "Goto 0, 0, 0",
        "color": "gray",
        "body": [],
        "args": {
          "version": 4,
          "locals": { kind: "scope_declaration", args: {} },
        },
        "kind": "sequence"
      },
      "uuid": "Sequence.23.47"
    };
  }

  function fakeProps(): TestBtnProps {
    return {
      sequence: fakeSequence(),
      syncStatus: "synced",
      resources: buildResourceIndex().index,
      shouldDisplay: () => false,
      menuOpen: false,
      dispatch: jest.fn(),
    };
  }

  it("doesn't fire if unsaved", () => {
    const props = fakeProps();
    props.sequence.specialStatus = SpecialStatus.DIRTY;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("pseudo-disabled")).toBeTruthy();
    expect(warning).toHaveBeenCalled();
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
  });

  it("doesn't fire if unsynced", () => {
    const props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("pseudo-disabled")).toBeTruthy();
    expect(warning).toHaveBeenCalled();
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
  });

  it("does fire if saved and synced", () => {
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("orange")).toBeTruthy();
    expect(warning).not.toHaveBeenCalled();
    expect(mockDevice.execSequence).toHaveBeenCalledWith(props.sequence.body.id);
  });

  it("opens parameter assignment menu", () => {
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    mockHasParameters = true;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button").first();
    btn.simulate("click");
    expect(btn.hasClass("orange")).toBeTruthy();
    expect(warning).not.toHaveBeenCalled();
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
    expect(props.dispatch).toHaveBeenCalledWith(setMenuOpen(true));
  });

  it("has open parameter assignment menu", () => {
    const props = fakeProps();
    mockHasParameters = true;
    props.menuOpen = true;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button").first();
    expect(btn.hasClass("gray")).toBeTruthy();
    expect(btn.text()).toEqual("Close");
    expect(result.html()).toContain("locals-list");
  });

  it("has open parameter assignment menu", () => {
    const declaration: VariableDeclaration = {
      kind: "variable_declaration",
      args: {
        label: "label", data_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    };
    const props = fakeProps();
    const wrapper = mount<TestButton>(<TestButton {...props} />);
    wrapper.instance().editDeclaration(declaration);
    expect(wrapper.state().declarations).toEqual([declaration]);
  });

  it("calls sequence with declarations", () => {
    const declaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: { label: "label", data_type: "point" }
    };
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const varData = fakeVariableNameSet("label");
    (varData["label"] as SequenceMeta).celeryNode = declaration;
    props.resources.sequenceMetas[props.sequence.uuid] = varData;
    const wrapper = mount<TestButton>(<TestButton {...props} />);
    clickButton(wrapper, 1, "test");
    expect(mockDevice.execSequence).toHaveBeenCalledWith(props.sequence.body.id, [{
      kind: "variable_declaration",
      args: {
        label: "label", data_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    }
    ]);
  });

  it("calls sequence with declarations", () => {
    const declaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: { label: "label", data_type: "point" }
    };
    const props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const varData = fakeVariableNameSet("label");
    (varData["label"] as SequenceMeta).celeryNode = declaration;
    props.resources.sequenceMetas[props.sequence.uuid] = varData;
    const wrapper = mount<TestButton>(<TestButton {...props} />);
    clickButton(wrapper, 1, "test");
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalled();
  });

  it("closes menu on unmount", () => {
    const props = fakeProps();
    const wrapper = mount(<TestButton {...props} />);
    wrapper.unmount();
    expect(props.dispatch).toHaveBeenCalledWith(setMenuOpen(false));
  });
});
