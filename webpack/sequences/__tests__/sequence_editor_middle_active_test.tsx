jest.mock("../../api/crud", () => ({
  destroy: jest.fn()
}));

const mockCopy = jest.fn();
jest.mock("../actions", () => ({
  copySequence: mockCopy
}));

const mockSplice = jest.fn();
const mockMove = jest.fn();
jest.mock("../step_tiles/index", () => ({
  splice: mockSplice,
  move: mockMove
}));

import * as React from "react";
import {
  SequenceEditorMiddleActive, onDrop
} from "../sequence_editor_middle_active";
import { mount } from "enzyme";
import { ActiveMiddleProps } from "../interfaces";
import {
  FAKE_RESOURCES, buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { destroy } from "../../api/crud";
import { fakeHardwareFlags } from "../../__test_support__/sequence_hardware_settings";

describe("<SequenceEditorMiddleActive/>", () => {
  function fakeProps(): ActiveMiddleProps {
    return {
      dispatch: jest.fn(),
      sequence: fakeSequence(),
      resources: buildResourceIndex(FAKE_RESOURCES).index,
      syncStatus: "synced",
      consistent: true,
      autoSyncEnabled: false,
      hardwareFlags: fakeHardwareFlags(),
      farmwareInfo: {
        farmwareNames: [],
        firstPartyFarmwareNames: [],
        showFirstPartyFarmware: false
      },
      installedOsVersion: undefined,
    };
  }

  function clickButton(position: number, text: string) {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    const button = wrapper.find("button").at(position);
    expect(button.text()).toEqual(text);
    button.simulate("click");
  }

  it("deletes", () => {
    clickButton(2, "Delete");
    expect(destroy).toHaveBeenCalledWith(expect.stringContaining("Sequence"));
  });

  it("copies", () => {
    clickButton(3, "Copy");
    expect(mockCopy).toHaveBeenCalledWith(expect.objectContaining({
      uuid: expect.stringContaining("Sequence")
    }));
  });

  it("has drag area", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps()} />);
    expect(wrapper.find(".drag-drop-area").text()).toEqual("DRAG COMMAND HERE");
  });
});

describe("onDrop()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("step_splice", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(0, "fakeUuid");
    dispatch.mock.calls[0][0](() => {
      return { value: 1, intent: "step_splice", draggerId: 2 };
    });
    expect(mockSplice).toHaveBeenCalledWith(expect.objectContaining({
      step: 1,
      index: 0
    }));
  });

  it("step_move", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(3, "fakeUuid");
    dispatch.mock.calls[0][0](() => {
      return { value: 4, intent: "step_move", draggerId: 5 };
    });
    expect(mockMove).toHaveBeenCalledWith(expect.objectContaining({
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
