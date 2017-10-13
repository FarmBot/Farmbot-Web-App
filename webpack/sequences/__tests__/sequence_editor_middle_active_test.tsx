const mockDestroy = jest.fn();
jest.mock("../../api/crud", () => ({
  destroy: mockDestroy
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
import { SequenceEditorMiddleActive, onDrop } from "../sequence_editor_middle_active";
import { mount } from "enzyme";
import { ActiveMiddleProps } from "../interfaces";
import { FAKE_RESOURCES, buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("<SequenceEditorMiddleActive/>", () => {
  function fakeProps(): ActiveMiddleProps {
    return {
      slots: [],
      dispatch: jest.fn(),
      sequence: fakeSequence(),
      sequences: [],
      tools: [],
      resources: buildResourceIndex(FAKE_RESOURCES).index,
      syncStatus: "synced"
    };
  }

  function clickButton(position: number, text: string) {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps() } />);
    const button = wrapper.find("button").at(position);
    expect(button.text()).toEqual(text);
    button.simulate("click");
  }

  it("deletes", () => {
    clickButton(2, "Delete");
    expect(mockDestroy).toHaveBeenCalledWith("sequences.0.16");
  });

  it("copies", () => {
    clickButton(3, "Copy");
    expect(mockCopy.mock.calls[0][0].uuid).toEqual("sequences.1.33");
  });

  it("has drag area", () => {
    const wrapper = mount(<SequenceEditorMiddleActive {...fakeProps() } />);
    expect(wrapper.find(".drag-drop-area").text()).toEqual("DRAG COMMAND HERE");
  });
});

describe("onDrop()", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("step_splice", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(0, "");
    dispatch.mock.calls[0][0](() => {
      return { value: 1, intent: "step_splice", draggerId: 2 };
    });
    const argsList = mockSplice.mock.calls[0][0];
    expect(argsList.step).toEqual(1);
    expect(argsList.index).toEqual(0);
  });

  it("step_move", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(3, "");
    dispatch.mock.calls[0][0](() => {
      return { value: 4, intent: "step_move", draggerId: 5 };
    });
    const argsList = mockMove.mock.calls[0][0];
    expect(argsList.step).toEqual(4);
    expect(argsList.to).toEqual(3);
    expect(argsList.from).toEqual(5);
  });
});
