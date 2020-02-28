import {
  sequence2ddi, mapStateToProps, RawBootSequenceSelector,
} from "../boot_sequence_selector";
import {
  fakeSequence, fakeFbosConfig,
} from "../../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../../__test_support__/resource_index_builder";
import React from "react";
import { mount } from "enzyme";
import { FBSelect } from "../../../../ui";
// import { mount } from "enzyme";
// import React from "react";
// import { FBSelect } from "../../../../ui";

describe("sequence2ddi", () => {
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

const fakeProps = () => {
  const state = fakeState();
  const sequence = fakeSequence();
  const config = fakeFbosConfig();
  sequence.body.id = 1;
  config.body.boot_sequence_id = 1;
  state.resources =
    buildResourceIndex([config, fakeFbosConfig(), sequence]);
  return mapStateToProps(state);
};

describe("mapStateToProps", () => {
  it("creates props", () => {
    const result = fakeProps();
    if (result.selectedItem) {
      expect(result.selectedItem.value).toEqual(1);
    } else {
      fail();
    }
  });

  it("crashes when config is missing", () => {
    const state = fakeState();
    const boom = () => mapStateToProps(state);
    expect(boom).toThrowError("No config found?");
  });
});

describe("RawBootSequenceSelector", () => {
  it("handles the `onChange` event", () => {
    const props = fakeProps();
    const el = new RawBootSequenceSelector(props);
    el.onChange({ label: "X", value: 3 });
    expect(props.dispatch).toHaveBeenCalled();
    expect(props.dispatch)
      .toHaveBeenCalledWith(expect.objectContaining({ type: "EDIT_RESOURCE" }));
  });

  it("renders", () => {
    const props = fakeProps();
    const el = mount(<RawBootSequenceSelector {...props} />);
    expect(el.find(FBSelect).length).toEqual(1);
  });
});
