let mockPath = "";
jest.mock("../../history", () => ({
  push: jest.fn(),
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  save: jest.fn(),
  edit: jest.fn()
}));

jest.mock("../actions", () => ({
  copySequence: jest.fn(),
  editCurrentSequence: jest.fn(),
  pinSequenceToggle: jest.fn(),
  publishSequence: jest.fn(() => jest.fn()),
  unpublishSequence: jest.fn(() => jest.fn()),
  upgradeSequence: jest.fn(() => jest.fn()),
}));

jest.mock("../step_tiles/index", () => ({
  splice: jest.fn(),
  move: jest.fn(),
  renderCeleryNode: () => <div />,
  stringifySequenceData: jest.fn(),
}));

jest.mock("../../devices/actions", () => ({
  execSequence: jest.fn()
}));

jest.mock("../locals_list/locals_list", () => ({
  LocalsList: () => <div />,
  localListCallback: jest.fn(() => jest.fn()),
  isParameterDeclaration: jest.fn(),
  removeVariable: jest.fn(),
}));

jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
  getWebAppConfigValue: jest.fn(() => jest.fn()),
}));

let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: { futureFeaturesEnabled: () => mockDev }
}));

import React from "react";
import {
  SequenceEditorMiddleActive, onDrop, SequenceName, AddCommandButton,
  SequenceSettingsMenu,
  SequenceSetting,
  SequenceHeader,
  SequenceBtnGroup,
  SequenceShareMenu,
  SequencePublishMenu,
} from "../sequence_editor_middle_active";
import { mount, shallow } from "enzyme";
import {
  ActiveMiddleProps, SequenceBtnGroupProps, SequenceSettingProps,
  SequenceSettingsMenuProps,
  SequenceShareMenuProps,
} from "../interfaces";
import {
  FAKE_RESOURCES, buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { destroy, save, edit } from "../../api/crud";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../__test_support__/fake_sequence_step_data";
import { SpecialStatus, ParameterDeclaration } from "farmbot";
import { move, splice, stringifySequenceData } from "../step_tiles";
import {
  copySequence, editCurrentSequence, pinSequenceToggle, publishSequence,
  upgradeSequence,
} from "../actions";
import { execSequence } from "../../devices/actions";
import { clickButton } from "../../__test_support__/helpers";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { DropAreaProps } from "../../draggable/interfaces";
import { Actions, DeviceSetting } from "../../constants";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";
import { push } from "../../history";
import { maybeTagStep } from "../../resources/sequence_tagging";
import { error } from "../../toast/toast";
import { API } from "../../api";

describe("<SequenceEditorMiddleActive />", () => {
  const fakeProps = (): ActiveMiddleProps => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.DIRTY;
    return {
      dispatch: jest.fn(),
      sequence,
      resources: buildResourceIndex(FAKE_RESOURCES).index,
      syncStatus: "synced",
      hardwareFlags: fakeHardwareFlags(),
      farmwareData: fakeFarmwareData(),
      getWebAppConfigValue: jest.fn(),
      menuOpen: undefined,
      showName: true,
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    expect(wrapper.html()).not.toContain("fa-code");
    expect(wrapper.text()).not.toContain("locals");
    expect(wrapper.html()).not.toContain("fa-code-fork");
  });

  it("upgrades sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [2];
    p.sequence.body.forked = true;
    p.getWebAppConfigValue = () => true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".transparent-button").simulate("click");
    expect(upgradeSequence).toHaveBeenCalledWith(123, 2);
  });

  it("resets forked sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [1];
    p.sequence.body.forked = true;
    p.getWebAppConfigValue = () => true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".transparent-button").simulate("click");
    expect(upgradeSequence).toHaveBeenCalledWith(123, 1);
  });

  it("renders celery script view control", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    expect(wrapper.html()).toContain("fa-code");
    expect(wrapper.text()).not.toContain("locals");
  });

  it("toggles celery script view", () => {
    const p = fakeProps();
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const wrapper = mount<SequenceEditorMiddleActive>(
      <SequenceEditorMiddleActive {...p} />);
    expect(wrapper.state().viewSequenceCeleryScript).toEqual(false);
    expect(stringifySequenceData).not.toHaveBeenCalled();
    wrapper.find(SequenceHeader).props().toggleViewSequenceCeleryScript();
    expect(wrapper.state().viewSequenceCeleryScript).toEqual(true);
    expect(stringifySequenceData).toHaveBeenCalled();
  });

  it("saves", async () => {
    const p = fakeProps();
    p.dispatch = () => Promise.resolve();
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    await clickButton(wrapper, 0, "Save * ");
    expect(save).toHaveBeenCalledWith(expect.stringContaining("Sequence"));
    expect(push).toHaveBeenCalledWith("/app/sequences/fake");
  });

  it("tests", () => {
    const p = fakeProps();
    p.syncStatus = "synced";
    p.sequence.specialStatus = SpecialStatus.SAVED;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    clickButton(wrapper, 1, "Run");
    expect(execSequence).toHaveBeenCalledWith(p.sequence.body.id);
  });

  it("deletes with confirmation", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => undefined;
    p.dispatch = jest.fn(() => Promise.resolve());
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".fa-trash").simulate("click");
    expect(destroy).toHaveBeenCalledWith(
      expect.stringContaining("Sequence"), false);
  });

  it("deletes without confirmation", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => false;
    p.dispatch = jest.fn(() => Promise.resolve());
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".fa-trash").simulate("click");
    expect(destroy).toHaveBeenCalledWith(
      expect.stringContaining("Sequence"), true);
  });

  it("copies", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    wrapper.find(".fa-copy").simulate("click");
    expect(copySequence).toHaveBeenCalledWith(expect.objectContaining({
      uuid: expect.stringContaining("Sequence")
    }));
  });

  it("has drag area", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    expect(wrapper.find(".drag-drop-area").text()).toEqual("DRAG COMMAND HERE");
  });

  it("calls DropArea callback", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = dispatch;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    const props = wrapper.find("DropArea").props() as DropAreaProps;
    props.callback?.("key");
    dispatch.mock.calls[0][0](() =>
      ({ value: 1, intent: "step_splice", draggerId: 2 }));
    expect(splice).toHaveBeenCalledWith(expect.objectContaining({
      step: 1,
      index: Infinity
    }));
  });

  it("has correct height", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    expect(wrapper.find(".sequence").props().style).toEqual({
      height: "calc(100vh - 200px)"
    });
  });

  it("has correct height without variable form", () => {
    const p = fakeProps();
    p.resources.sequenceMetas = { [p.sequence.uuid]: {} };
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    expect(wrapper.find(".sequence").props().style).toEqual({
      height: "calc(100vh - 200px)"
    });
  });

  it("has correct height with variable form", () => {
    const p = fakeProps();
    const vector = { x: 0, y: 0, z: 0 };
    const node: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "variable",
        default_value: { kind: "coordinate", args: vector }
      }
    };
    const variables = fakeVariableNameSet("variable", vector, node);
    p.resources.sequenceMetas = { [p.sequence.uuid]: variables };
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    expect(wrapper.find(".sequence").props().style)
      .toEqual({ height: "calc(100vh - 500px)" });
  });

  it("has correct height with variable form collapsed", () => {
    const p = fakeProps();
    p.resources.sequenceMetas = { [p.sequence.uuid]: fakeVariableNameSet() };
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.setState({ variablesCollapsed: true });
    expect(wrapper.find(".sequence").props().style)
      .toEqual({ height: "calc(100vh - 300px)" });
  });

  it("automatically calculates height", () => {
    document.getElementById = () => ({ offsetHeight: 101 } as HTMLElement);
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    expect(wrapper.find(".sequence").props().style)
      .toEqual({ height: "calc(100vh - 301px)" });
  });

  it("toggles variable form state", () => {
    const wrapper = mount<SequenceEditorMiddleActive>(
      <SequenceEditorMiddleActive {...fakeProps()} />);
    wrapper.find(SequenceHeader).props().toggleVarShow();
    expect(wrapper.state().variablesCollapsed).toEqual(true);
  });

  it("visualizes", () => {
    mockPath = "/app/designer/sequences/1";
    const p = fakeProps();
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".fa-eye-slash").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.VISUALIZE_SEQUENCE,
      payload: p.sequence.uuid,
    });
  });

  it("un-visualizes", () => {
    mockPath = "/app/designer/sequences/1";
    const p = fakeProps();
    p.visualized = true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".fa-eye").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.VISUALIZE_SEQUENCE,
      payload: undefined,
    });
  });

  it("pins sequence", () => {
    mockPath = "/app/designer/sequences/1";
    const p = fakeProps();
    p.sequence.body.pinned = false;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".fa-thumb-tack").simulate("click");
    expect(pinSequenceToggle).toHaveBeenCalledWith(p.sequence);
  });

  it("unpins sequence", () => {
    mockPath = "/app/designer/sequences/1";
    const p = fakeProps();
    p.sequence.body.pinned = true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    wrapper.find(".fa-thumb-tack").simulate("click");
    expect(pinSequenceToggle).toHaveBeenCalledWith(p.sequence);
  });
});

describe("<SequenceBtnGroup />", () => {
  const fakeProps = (): SequenceBtnGroupProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    resources: buildResourceIndex(FAKE_RESOURCES).index,
    syncStatus: "synced",
    getWebAppConfigValue: jest.fn(),
    toggleViewSequenceCeleryScript: jest.fn(),
    menuOpen: undefined,
    viewCeleryScript: true,
  });

  it("edits color", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequenceBtnGroup {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(editCurrentSequence).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ uuid: p.sequence.uuid }),
      { color: "red" });
  });

  it("shows view celery script enabled", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    p.viewCeleryScript = true;
    const wrapper = shallow(<SequenceBtnGroup {...p} />);
    expect(wrapper.find(".fa-code").hasClass("enabled")).toBeTruthy();
  });

  it("shows publish menu", () => {
    mockDev = true;
    const wrapper = shallow(<SequenceBtnGroup {...fakeProps()} />);
    expect(wrapper.find(".publish-button").length).toEqual(1);
  });

  it("shows share menu", () => {
    mockDev = true;
    const p = fakeProps();
    p.sequence.body.sequence_versions = [1, 2, 3];
    const wrapper = shallow(<SequenceBtnGroup {...p} />);
    expect(wrapper.find(".publish-button").length).toEqual(1);
  });
});

describe("onDrop()", () => {
  it("step_splice", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(0, "fakeUuid");
    dispatch.mock.calls[0][0](() =>
      ({ value: 1, intent: "step_splice", draggerId: 2 }));
    expect(splice).toHaveBeenCalledWith(expect.objectContaining({
      step: 1,
      index: 0
    }));
  });

  it("step_move", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(3, "fakeUuid");
    dispatch.mock.calls[0][0](() =>
      ({ value: 4, intent: "step_move", draggerId: 5 }));
    expect(move).toHaveBeenCalledWith(expect.objectContaining({
      step: 4,
      to: 3,
      from: 5
    }));
  });

  it("not a valid step object", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(0, "");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("throws error", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(3, "fakeUuid");
    const nope = () => dispatch.mock.calls[0][0](() =>
      ({ value: 4, intent: "nope", draggerId: 5 }));
    expect(nope).toThrowError("Got unexpected data transfer object.");
  });
});

describe("<SequenceName />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("edits name", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequenceName {...p} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(edit).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: p.sequence.uuid }),
      { name: "new name" });
  });
});

describe("<AddCommandButton />", () => {
  it("dispatches new step position", () => {
    mockPath = "";
    const dispatch = jest.fn();
    const wrapper = shallow(<AddCommandButton dispatch={dispatch} index={1} />);
    wrapper.find("button").simulate("click");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SEQUENCE_STEP_POSITION,
      payload: 1,
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates", () => {
    mockPath = "/app/designer/sequences/1";
    const dispatch = jest.fn();
    const wrapper = shallow(<AddCommandButton dispatch={dispatch} index={1} />);
    wrapper.find("button").simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/sequences/commands");
  });
});

describe("<SequenceSettingsMenu />", () => {
  const fakeProps = (): SequenceSettingsMenuProps => ({
    dispatch: jest.fn(),
    getWebAppConfigValue: jest.fn(),
  });

  it("renders settings", () => {
    const wrapper = mount(<SequenceSettingsMenu {...fakeProps()} />);
    wrapper.find("button").at(0).simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.confirm_step_deletion, true);
    wrapper.find("button").at(2).simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_pins, true);
  });
});

describe("<SequencePublishMenu />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequenceShareMenuProps => ({
    sequence: fakeSequence(),
  });

  it("publishes sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    const wrapper = mount(<SequencePublishMenu {...p} />);
    clickButton(wrapper, 0, "publish");
    expect(publishSequence).toHaveBeenCalledWith(123);
  });

  it("doesn't publish sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<SequencePublishMenu {...p} />);
    clickButton(wrapper, 0, "publish");
    expect(publishSequence).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });
});

describe("<SequenceShareMenu />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequenceShareMenuProps => ({
    sequence: fakeSequence(),
  });

  it("renders versions", () => {
    const p = fakeProps();
    p.sequence.body.sequence_versions = [20, 21, 22];
    const wrapper = mount(<SequenceShareMenu {...p} />);
    expect(wrapper.text()).toContain("V1");
  });

  it("publishes sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    const wrapper = mount(<SequenceShareMenu {...p} />);
    clickButton(wrapper, 0, "", { icon: "fa-plus" });
    expect(publishSequence).toHaveBeenCalledWith(123);
  });

  it("doesn't publish sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<SequenceShareMenu {...p} />);
    clickButton(wrapper, 0, "", { icon: "fa-plus" });
    expect(publishSequence).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });
});

describe("<SequenceSetting />", () => {
  const fakeProps = (): SequenceSettingProps => ({
    label: DeviceSetting.showPins,
    description: "setting description",
    dispatch: jest.fn(),
    setting: BooleanSetting.discard_unsaved_sequences,
    getWebAppConfigValue: jest.fn(),
    confirmation: "setting confirmation",
  });

  it("confirms setting enable", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => false;
    const wrapper = mount(<SequenceSetting {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith("setting confirmation");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.discard_unsaved_sequences, true);
  });

  it("cancels setting enable", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => false;
    const wrapper = mount(<SequenceSetting {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith("setting confirmation");
    expect(setWebAppConfigValue).not.toHaveBeenCalled();
  });

  it("doesn't confirm setting disable", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    const wrapper = mount(<SequenceSetting {...p} />);
    window.confirm = jest.fn();
    wrapper.find("button").simulate("click");
    expect(window.confirm).not.toHaveBeenCalled();
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.discard_unsaved_sequences, false);
  });

  it("is enabled by default", () => {
    const p = fakeProps();
    p.confirmation = undefined;
    p.defaultOn = true;
    p.getWebAppConfigValue = () => undefined;
    const wrapper = mount(<SequenceSetting {...p} />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      expect.any(String), false);
  });
});
