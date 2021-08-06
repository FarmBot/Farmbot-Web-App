jest.mock("../../../sequences/set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn()
}));

jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
}));

import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerSequenceEditor as DesignerSequenceEditor, ResourceTitle,
  ResourceTitleProps,
} from "../editor";
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
import {
  setActiveSequenceByName,
} from "../../set_active_sequence_by_name";
import { push } from "../../../history";

describe("<DesignerSequenceEditor />", () => {
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
    const wrapper = mount(<DesignerSequenceEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("save");
  });

  it("handles missing sequence", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(wrapper.text().toLowerCase()).toContain("no sequence selected");
  });

  it("navigates to full page editor", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 500,
      configurable: true
    });
    const p = fakeProps();
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    wrapper.find("a").first().simulate("click");
    expect(push).toHaveBeenCalledWith("/app/sequences/fake");
  });
});

describe("<ResourceTitle />", () => {
  const fakeProps = (): ResourceTitleProps => ({
    dispatch: jest.fn(),
    resource: fakeSequence(),
  });

  it("changes name", () => {
    const wrapper = mount(<ResourceTitle {...fakeProps()} />);
    wrapper.find("span").first().simulate("click");
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "abc" } });
    wrapper.find("input").first().simulate("blur");
  });
});
