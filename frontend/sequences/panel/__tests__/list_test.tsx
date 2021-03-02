import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerSequenceList as DesignerSequenceList,
} from "../list";
import { SequencesProps } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, FAKE_RESOURCES,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../../__test_support__/fake_sequence_step_data";
import { mapStateToFolderProps } from "../../../folders/map_state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<DesignerSequenceList />", () => {
  const fakeProps = (): SequencesProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    sequences: [],
    resources: buildResourceIndex(FAKE_RESOURCES).index,
    syncStatus: "synced",
    hardwareFlags: fakeHardwareFlags(),
    farmwareData: fakeFarmwareData(),
    shouldDisplay: jest.fn(),
    getWebAppConfigValue: jest.fn(),
    menuOpen: undefined,
    stepIndex: undefined,
    folderData: mapStateToFolderProps(fakeState()),
  });

  it("renders", () => {
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    expect(wrapper.text()).toContain("folder");
  });
});
