import {
  sequence2ddi, mapStateToProps, RawBootSequenceSelector,
  BootSequenceSelectorProps,
} from "../boot_sequence_selector";
import {
  fakeSequence, fakeFbosConfig,
} from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import React from "react";
import { mount } from "enzyme";
import { FBSelect } from "../../../ui";
import { fireEvent, render, screen } from "@testing-library/react";

describe("sequence2ddi()", () => {
  it("converts TaggedSequences", () => {
    const s = fakeSequence();
    s.body.id = 1;
    s.body.args.locals.body = [];
    const result1 = sequence2ddi(s);
    expect(result1).toBeTruthy();
    s.body.args.locals.body = undefined;
    const result2 = sequence2ddi(s);
    expect(result2).toBeTruthy();
  });

  it("doesn't convert TaggedSequences with variables", () => {
    const s = fakeSequence();
    s.body.id = 1;
    s.body.args.locals.body = [{
      kind: "variable_declaration",
      args: {
        label: "foo",
        data_value: {
          kind: "point",
          args: {
            pointer_id: 1,
            pointer_type: "GenericPointer"
          }
        }
      }
    }];
    const result1 = sequence2ddi(s);
    expect(result1).not.toBeTruthy();
  });

  it("doesn't convert TaggedSequences missing an ID", () => {
    const s = fakeSequence();
    s.body.id = undefined;
    const result1 = sequence2ddi(s);
    expect(result1).not.toBeTruthy();
  });
});

describe("mapStateToProps()", () => {
  it("creates props", () => {
    const state = fakeState();
    const sequence = fakeSequence();
    const config = fakeFbosConfig();
    sequence.body.id = 1;
    config.body.boot_sequence_id = 1;
    state.resources = buildResourceIndex([config, fakeFbosConfig(), sequence]);
    expect(mapStateToProps(state).selectedItem?.value).toEqual(1);
  });

  it("crashes when config is missing", () => {
    const state = fakeState();
    const boom = () => mapStateToProps(state);
    expect(boom).toThrow("No config found?");
  });

  it("handles no boot_sequence_id", () => {
    const state = fakeState();
    const config = fakeFbosConfig();
    config.body.boot_sequence_id = undefined;
    state.resources = buildResourceIndex([config]);
    expect(mapStateToProps(state).selectedItem).toEqual(undefined);
  });
});

describe("<RawBootSequenceSelector />", () => {
  const fakeProps = (): BootSequenceSelectorProps => ({
    list: [],
    selectedItem: undefined,
    config: fakeFbosConfig(),
    dispatch: jest.fn(),
    firmwareHardware: "arduino",
  });

  it("handles the `onChange` event", () => {
    const p = fakeProps();
    p.list = [{ label: "X", value: 3 }];
    render(<RawBootSequenceSelector {...p} />);
    const select = screen.getByRole("button", { name: "None" });
    fireEvent.click(select);
    const item = screen.getByText("X");
    fireEvent.click(item);
    expect(p.dispatch)
      .toHaveBeenCalledWith(expect.objectContaining({ type: "EDIT_RESOURCE" }));
  });

  it("renders: no selection", () => {
    const wrapper = mount(<RawBootSequenceSelector {...fakeProps()} />);
    expect(wrapper.find(FBSelect).props().selectedItem).toEqual(undefined);
  });

  it("renders", () => {
    const p = fakeProps();
    p.selectedItem = { value: 1, label: "" };
    const wrapper = mount(<RawBootSequenceSelector {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem).toEqual(p.selectedItem);
  });
});
