jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { Sequences } from "../sequences";
import { shallow } from "enzyme";
import { Props } from "../interfaces";
import {
  FAKE_RESOURCES, buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { ToolTips } from "../../constants";
import {
  fakeHardwareFlags
} from "../../__test_support__/sequence_hardware_settings";

describe("<Sequences/>", () => {
  function fakeProps(): Props {
    return {
      dispatch: jest.fn(),
      sequence: fakeSequence(),
      sequences: [],
      resources: buildResourceIndex(FAKE_RESOURCES).index,
      syncStatus: "synced",
      hardwareFlags: fakeHardwareFlags(),
      farmwareInfo: {
        farmwareNames: [],
        firstPartyFarmwareNames: [],
        showFirstPartyFarmware: false,
        farmwareConfigs: {},
      },
      shouldDisplay: jest.fn(),
      confirmStepDeletion: false,
    };
  }

  it("renders", () => {
    const wrapper = shallow(<Sequences {...fakeProps()} />);
    expect(wrapper.html()).toContain("Sequences");
    expect(wrapper.html()).toContain("Sequence Editor");
    expect(wrapper.html()).toContain(ToolTips.SEQUENCE_EDITOR);
    expect(wrapper.html()).toContain("Commands");
  });

  it("step command cluster is hidden", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = shallow(<Sequences {...p} />);
    expect(wrapper.text()).not.toContain("Commands");
  });
});
