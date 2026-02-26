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
import { fireEvent, render, screen } from "@testing-library/react";
import * as crud from "../../../api/crud";
import * as ui from "../../../ui";

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      list: Array<{ label: string, value: number | string }>;
      selectedItem: unknown;
      onChange: (item: { label: string, value: number | string }) => void;
    }) =>
      <div>
        <span data-testid="selected-item">
          {JSON.stringify(props.selectedItem)}
        </span>
        <button onClick={() =>
          props.onChange(props.list[0] || { label: "", value: "" })}>
          mock-select
        </button>
      </div>);
});

afterEach(() => {
  editSpy.mockRestore();
  saveSpy.mockRestore();
  fbSelectSpy.mockRestore();
});

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
    sequence.body.id = 1;
    sequence.body.name = "boot sequence";
    sequence.body.args.locals.body = [];
    const config = fakeFbosConfig();
    config.body.boot_sequence_id = 1;
    state.resources = buildResourceIndex([config, sequence]);
    const props = mapStateToProps(state);
    const selectedItem = props.selectedItem;
    expect(props.config.kind).toEqual("FbosConfig");
    expect(Array.isArray(props.list)).toBeTruthy();
    if (selectedItem) {
      expect(typeof selectedItem.label).toEqual("string");
      expect(selectedItem.label.length).toBeGreaterThan(0);
    }
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
    fireEvent.click(screen.getByText("mock-select"));
    expect(crud.edit).toHaveBeenCalledWith(p.config, { boot_sequence_id: 3 });
    expect(crud.save).toHaveBeenCalledWith(p.config.uuid);
  });

  it("renders: no selection", () => {
    render(<RawBootSequenceSelector {...fakeProps()} />);
    expect(screen.getByTestId("selected-item").textContent).toEqual("");
  });

  it("renders", () => {
    const p = fakeProps();
    p.selectedItem = { value: 1, label: "" };
    render(<RawBootSequenceSelector {...p} />);
    expect(screen.getByTestId("selected-item").textContent)
      .toEqual(JSON.stringify(p.selectedItem));
  });
});
