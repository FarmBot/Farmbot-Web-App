let mockIsMobile = false;
jest.mock("../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

jest.mock("axios", () => ({
  get: () => Promise.resolve({
    data: [
      { id: 1, name: "name", description: "", path: "", color: "gray" },
    ]
  }),
}));

import React from "react";
import {
  RawSequences as Sequences, SequenceBackButtonProps, SequenceBackButton,
} from "../sequences";
import { shallow, mount } from "enzyme";
import { SequencesProps } from "../interfaces";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../__test_support__/fake_sequence_step_data";
import { mapStateToFolderProps } from "../../folders/map_state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { sequencesPanelState } from "../../__test_support__/panel_state";
import { emptyState } from "../../resources/reducer";
import { Path } from "../../internal_urls";
import { API } from "../../api";

describe("<Sequences />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequencesProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    sequences: [],
    resources: buildResourceIndex().index,
    syncStatus: "synced",
    hardwareFlags: fakeHardwareFlags(),
    farmwareData: fakeFarmwareData(),
    getWebAppConfigValue: jest.fn(),
    sequencesState: emptyState().consumers.sequences,
    folderData: mapStateToFolderProps(fakeState()),
    sequencesPanelState: sequencesPanelState(),
  });

  it("renders", () => {
    const wrapper = shallow(<Sequences {...fakeProps()} />);
    expect(wrapper.html()).toContain("Sequences");
  });

  it("step command cluster is hidden", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = shallow(<Sequences {...p} />);
    expect(wrapper.text()).not.toContain("Commands");
  });

  it("makes inserting step mode active", () => {
    const p = fakeProps();
    p.sequencesState.stepIndex = 2;
    const wrapper = shallow(<Sequences {...p} />);
    expect(wrapper.html()).toContain("inserting-step");
  });

  it("redirects to mobile interface", () => {
    location.pathname = Path.mock(Path.sequencePage());
    mockIsMobile = true;
    const p = fakeProps();
    p.sequence = undefined;
    mount(<Sequences {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(Path.designerSequences());
  });

  it("redirects to mobile interface: sequence selected", () => {
    location.pathname = Path.mock(Path.sequencePage());
    mockIsMobile = true;
    const p = fakeProps();
    p.sequence = fakeSequence();
    mount(<Sequences {...p} />);
    expect(mockNavigate).toHaveBeenCalledWith(Path.designerSequences("fake"));
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
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("goes back to sequence list", () => {
    const p = fakeProps();
    p.className = "";
    const wrapper = mount(<SequenceBackButton {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_SEQUENCE, payload: undefined
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequences());
  });
});
