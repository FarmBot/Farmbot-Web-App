import React from "react";
import {
  RawSequences as Sequences, SequenceBackButtonProps, SequenceBackButton,
} from "../sequences";
import { shallow, mount } from "enzyme";
import { SequencesProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { ToolTips, Actions } from "../../constants";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../__test_support__/fake_sequence_step_data";
import { push } from "../../history";
import { mapStateToFolderProps } from "../../folders/map_state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { Path } from "../../internal_urls";
import { sequencesPanelState } from "../../__test_support__/panel_state";

describe("<Sequences />", () => {
  const fakeProps = (): SequencesProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    sequences: [],
    resources: buildResourceIndex().index,
    syncStatus: "synced",
    hardwareFlags: fakeHardwareFlags(),
    farmwareData: fakeFarmwareData(),
    getWebAppConfigValue: jest.fn(),
    menuOpen: undefined,
    stepIndex: undefined,
    folderData: mapStateToFolderProps(fakeState()),
    sequencesPanelState: sequencesPanelState(),
  });

  it("renders", () => {
    const wrapper = shallow(<Sequences {...fakeProps()} />);
    expect(wrapper.html()).toContain("Sequences");
    expect(wrapper.html()).toContain("Edit Sequence");
    expect(wrapper.html()).toContain(ToolTips.SEQUENCE_EDITOR);
    expect(wrapper.html()).toContain("Commands");
  });

  it("step command cluster is hidden", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = shallow(<Sequences {...p} />);
    expect(wrapper.text()).not.toContain("Commands");
  });

  it("makes inserting step mode active", () => {
    const p = fakeProps();
    p.stepIndex = 2;
    const wrapper = shallow(<Sequences {...p} />);
    expect(wrapper.html()).toContain("inserting-step");
  });
});

describe("<SequenceBackButton />", () => {
  const fakeProps = (): SequenceBackButtonProps => ({
    dispatch: jest.fn(),
    className: "",
  });

  it("goes back to sequence", () => {
    const p = fakeProps();
    p.className = "inserting-step";
    const wrapper = mount(<SequenceBackButton {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SEQUENCE_STEP_POSITION, payload: undefined
    });
    expect(push).not.toHaveBeenCalled();
  });

  it("goes back to sequence list", () => {
    const p = fakeProps();
    p.className = "";
    const wrapper = mount(<SequenceBackButton {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_SEQUENCE, payload: undefined
    });
    expect(push).toHaveBeenCalledWith(Path.sequences());
  });
});
