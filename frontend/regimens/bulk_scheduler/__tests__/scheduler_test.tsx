import React from "react";
import { mount, shallow } from "enzyme";
import {
  mapStateToProps,
  RawDesignerRegimenScheduler as DesignerRegimenScheduler,
} from "../scheduler";
import { DesignerPanelHeader } from "../../../farm_designer/designer_panel";
import {
  fakeRegimen,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { AddButton } from "../../bulk_scheduler/add_button";
import { RegimenSchedulerProps } from "../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";
import { Path } from "../../../internal_urls";

describe("<DesignerRegimenScheduler />", () => {
  const fakeProps = (): RegimenSchedulerProps => ({
    dispatch: jest.fn(),
    sequences: [],
    resources: buildResourceIndex([fakeDevice()]).index,
    current: fakeRegimen(),
    selectedSequence: undefined,
    dailyOffsetMs: 1000,
    weeks: [],
    device: fakeDevice(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.current = fakeRegimen();
    const wrapper = mount(<DesignerRegimenScheduler {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("schedule");
  });

  it("handles missing regimen", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = shallow(<DesignerRegimenScheduler {...p} />);
    expect(wrapper.find(DesignerPanelHeader).props().backTo)
      .toEqual(Path.regimens());
  });

  it("commits bulk editor", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const panel = shallow(<DesignerRegimenScheduler {...p} />);
    panel.find(AddButton).first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeDevice()]);
    const props = mapStateToProps(state);
    expect(props.sequences).toEqual([]);
  });
});
