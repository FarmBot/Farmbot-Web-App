import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerSequenceCommands as DesignerSequenceCommands,
} from "../commands";
import { StepButtonProps } from "../../../sequences/step_button_cluster";
import { DesignerPanelHeader } from "../../designer_panel";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<DesignerSequenceCommands />", () => {
  const fakeProps = (): StepButtonProps => ({
    dispatch: jest.fn(),
    current: undefined,
    shouldDisplay: () => false,
    stepIndex: undefined,
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
