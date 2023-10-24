const mockDevice = { execSequence: jest.fn((..._) => Promise.resolve()) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

let mockHasParameters = false;
jest.mock("../locals_list/is_parameterized", () => ({
  isParameterized: () => mockHasParameters
}));

jest.mock("../../ui/filter_search", () => ({
  FilterSearch: () => <div />
}));

import { PopoverProps } from "../../ui/popover";
jest.mock("../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { TestButton, TestBtnProps, setMenuOpen } from "../test_button";
import {
  SpecialStatus, ParameterApplication, ParameterDeclaration, Coordinate,
} from "farmbot";
import { mount } from "enzyme";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { warning } from "../../toast/toast";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { SequenceMeta } from "../../resources/sequence_meta";
import { clickButton } from "../../__test_support__/helpers";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";

describe("<TestButton />", () => {

  const fakeProps = (): TestBtnProps => ({
    sequence: fakeSequence(),
    syncStatus: "synced",
    resources: buildResourceIndex().index,
    menuOpen: fakeMenuOpenState(),
    dispatch: jest.fn(),
    component: "list",
  });

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
    expect(mockDevice.execSequence)
      .toHaveBeenCalledWith(props.sequence.body.id, undefined);
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
    expect(props.dispatch).toHaveBeenCalledWith(setMenuOpen({
      component: "list", uuid: props.sequence.uuid,
    }));
  });

  it("has open parameter assignment menu", () => {
    const props = fakeProps();
    mockHasParameters = true;
    props.menuOpen.component = "list";
    props.menuOpen.uuid = props.sequence.uuid;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button").first();
    expect(btn.hasClass("gray")).toBeTruthy();
    expect(btn.text()).toEqual("Close");
    expect(result.html()).toContain("locals-list");
  });

  it("closes parameter assignment menu", () => {
    const p = fakeProps();
    p.menuOpen.component = "list";
    p.menuOpen.uuid = p.sequence.uuid;
    p.syncStatus = "synced";
    p.sequence.specialStatus = SpecialStatus.SAVED;
    p.sequence.body.id = 1;
    mockHasParameters = true;
    const result = mount(<TestButton {...p} />);
    const btn = result.find("button").first();
    btn.simulate("click");
    expect(btn.hasClass("gray")).toBeTruthy();
    expect(warning).not.toHaveBeenCalled();
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith(setMenuOpen(fakeMenuOpenState()));
  });

  it("edits body variables", () => {
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    };
    const props = fakeProps();
    const wrapper = mount<TestButton>(<TestButton {...props} />);
    wrapper.instance().editBodyVariables(variable);
    expect(wrapper.state().bodyVariables).toEqual([variable]);
  });

  const COORDINATE: Coordinate = {
    kind: "coordinate", args: { x: 0, y: 0, z: 0 }
  };

  it("calls sequence with bodyVariables when synced", () => {
    const declaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: COORDINATE
      }
    };
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const varData = fakeVariableNameSet("label");
    (varData["label"] as SequenceMeta).celeryNode = declaration;
    props.resources.sequenceMetas[props.sequence.uuid] = varData;
    const wrapper = mount<TestButton>(<TestButton {...props} />);
    clickButton(wrapper, 1, "run");
    expect(mockDevice.execSequence)
      .toHaveBeenCalledWith(props.sequence.body.id, [{
        kind: "parameter_application",
        args: { label: "label", data_value: COORDINATE }
      },
      ]);
  });

  it("doesn't call sequence with bodyVariables when not synced", () => {
    const declaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: COORDINATE
      }
    };
    const props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const varData = fakeVariableNameSet("label");
    (varData["label"] as SequenceMeta).celeryNode = declaration;
    props.resources.sequenceMetas[props.sequence.uuid] = varData;
    const wrapper = mount<TestButton>(<TestButton {...props} />);
    clickButton(wrapper, 1, "run");
    expect(mockDevice.execSequence).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalled();
  });

  it("closes menu on unmount", () => {
    const props = fakeProps();
    const wrapper = mount(<TestButton {...props} />);
    wrapper.unmount();
    expect(props.dispatch).toHaveBeenCalledWith(setMenuOpen(fakeMenuOpenState()));
  });
});
