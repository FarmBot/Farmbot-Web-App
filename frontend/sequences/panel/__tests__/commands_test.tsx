import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerSequenceCommands as DesignerSequenceCommands, mapStateToProps,
} from "../commands";
import { StepButtonProps } from "../../step_button_cluster";
import { DesignerPanelHeader } from "../../../farm_designer/designer_panel";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeFarmwareData,
} from "../../../__test_support__/fake_sequence_step_data";

describe("<DesignerSequenceCommands />", () => {
  const fakeProps = (): StepButtonProps => ({
    dispatch: jest.fn(),
    current: undefined,
    shouldDisplay: () => false,
    stepIndex: undefined,
    farmwareData: fakeFarmwareData(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.current = fakeSequence();
    const wrapper = mount(<DesignerSequenceCommands {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("move");
  });

  it("handles missing sequence", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = shallow(<DesignerSequenceCommands {...p} />);
    expect(wrapper.find(DesignerPanelHeader).props().backTo)
      .toEqual("/app/designer/sequences/");
  });
});

describe("mapStateToProps()", () => {
  it("doesn't return active sequence", () => {
    const state = fakeState();
    state.resources.consumers.sequences.current = undefined;
    expect(mapStateToProps(state).current).toEqual(undefined);
  });

  it("returns active sequence", () => {
    const state = fakeState();
    const sequence = fakeSequence();
    state.resources = buildResourceIndex([sequence]);
    state.resources.consumers.sequences.current = sequence.uuid;
    expect(mapStateToProps(state).current).toEqual(sequence);
  });
});
