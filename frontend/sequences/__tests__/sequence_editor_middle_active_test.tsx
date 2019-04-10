jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  save: jest.fn(),
  edit: jest.fn()
}));

jest.mock("../actions", () => ({
  copySequence: jest.fn(),
  editCurrentSequence: jest.fn()
}));

jest.mock("../step_tiles/index", () => ({
  splice: jest.fn(),
  move: jest.fn()
}));

jest.mock("../../devices/actions", () => ({
  execSequence: jest.fn()
}));

jest.mock("../locals_list/locals_list", () => ({
  LocalsList: () => <div />,
  localListCallback: jest.fn(() => jest.fn()),
  isParameterDeclaration: jest.fn(),
}));

import * as React from "react";
import {
  SequenceEditorMiddleActive, onDrop, SequenceNameAndColor, AddCommandButton
} from "../sequence_editor_middle_active";
import { mount, shallow } from "enzyme";
import { ActiveMiddleProps, SequenceHeaderProps } from "../interfaces";
import {
  FAKE_RESOURCES, buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { destroy, save, edit } from "../../api/crud";
import {
  fakeHardwareFlags
} from "../../__test_support__/sequence_hardware_settings";
import { SpecialStatus } from "farmbot";
import { move, splice } from "../step_tiles";
import { copySequence, editCurrentSequence } from "../actions";
import { execSequence } from "../../devices/actions";
import { clickButton } from "../../__test_support__/helpers";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { DropAreaProps } from "../../draggable/interfaces";
import { Actions } from "../../constants";

describe("<SequenceEditorMiddleActive/>", () => {
  const fakeProps = (): ActiveMiddleProps => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.DIRTY;
    return {
      dispatch: jest.fn(),
      sequence,
      resources: buildResourceIndex(FAKE_RESOURCES).index,
      syncStatus: "synced",
      hardwareFlags: fakeHardwareFlags(),
      farmwareInfo: {
        farmwareNames: [],
        firstPartyFarmwareNames: [],
        showFirstPartyFarmware: false,
        farmwareConfigs: {},
      },
      shouldDisplay: jest.fn(),
      confirmStepDeletion: false,
      menuOpen: false,
    };
  };

  it("saves", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    clickButton(wrapper, 0, "Save * ");
    expect(save).toHaveBeenCalledWith(expect.stringContaining("Sequence"));
  });

  it("tests", () => {
    const p = fakeProps();
    p.syncStatus = "synced";
    p.sequence.specialStatus = SpecialStatus.SAVED;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    clickButton(wrapper, 1, "Test");
    expect(execSequence).toHaveBeenCalledWith(p.sequence.body.id);
  });

  it("deletes", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    clickButton(wrapper, 2, "Delete");
    expect(destroy).toHaveBeenCalledWith(expect.stringContaining("Sequence"));
  });

  it("copies", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    clickButton(wrapper, 3, "Copy");
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
    props.callback && props.callback("key");
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
    p.shouldDisplay = () => true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    expect(wrapper.find(".sequence").props().style).toEqual({
      height: "calc(100vh - 200px)"
    });
  });

  it("has correct height with variable form", () => {
    const p = fakeProps();
    p.resources.sequenceMetas = { [p.sequence.uuid]: fakeVariableNameSet() };
    p.shouldDisplay = () => true;
    const wrapper = mount(<SequenceEditorMiddleActive {...p} />);
    expect(wrapper.find(".sequence").props().style)
      .toEqual({ height: "calc(100vh - 500px)" });
  });

  it("has correct height with variable form collapsed", () => {
    const p = fakeProps();
    p.resources.sequenceMetas = { [p.sequence.uuid]: fakeVariableNameSet() };
    p.shouldDisplay = () => true;
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
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    const props = wrapper.find("SequenceHeader").props() as SequenceHeaderProps;
    props.toggleVarShow();
    expect(wrapper.state()).toEqual({ variablesCollapsed: true });
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
});

describe("<SequenceNameAndColor />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("edits name", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequenceNameAndColor {...p} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(edit).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: p.sequence.uuid }),
      { name: "new name" });
  });

  it("edits color", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequenceNameAndColor {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(editCurrentSequence).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ uuid: p.sequence.uuid }),
      { color: "red" });
  });
});

describe("<AddCommandButton />", () => {
  it("dispatches new step position", () => {
    const dispatch = jest.fn();
    const wrapper = shallow(<AddCommandButton dispatch={dispatch} index={1} />);
    wrapper.find("button").simulate("click");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SEQUENCE_STEP_POSITION,
      payload: 1,
    });
  });
});
