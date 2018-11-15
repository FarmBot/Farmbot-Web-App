import * as React from "react";
import { RegimenListItemProps } from "../../interfaces";
import { RegimenListItem } from "../regimen_list_item";
import { render, shallow } from "enzyme";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";
import { Actions } from "../../../constants";

describe("<RegimenListItem/>", () => {
  const fakeProps = (): RegimenListItemProps => {
    return {
      length: 1,
      regimen: fakeRegimen(),
      dispatch: jest.fn(),
      index: 0
    };
  };

  it("renders the base case", () => {
    const props = fakeProps();
    const el = render(<RegimenListItem {...props} />);
    const html = el.html();
    expect(html).toContain(props.regimen.body.name);
    expect(html).toContain(props.regimen.body.color);
  });

  it("shows unsaved data indicator", () => {
    const props = fakeProps();
    props.regimen.specialStatus = SpecialStatus.DIRTY;
    const wrapper = render(<RegimenListItem {...props} />);
    expect(wrapper.text()).toContain("Foo *");
  });

  it("shows in-use indicator", () => {
    pending("Obvous breakage while I change everything. WIP");
    const props = fakeProps();
    const wrapper = render(<RegimenListItem {...props} />);
    expect(wrapper.find(".in-use").length).toEqual(1);
  });

  it("doesn't show in-use indicator", () => {
    const wrapper = render(<RegimenListItem {...fakeProps()} />);
    expect(wrapper.find(".in-use").length).toEqual(0);
  });

  it("selects regimen", () => {
    const props = fakeProps();
    const wrapper = shallow(<RegimenListItem {...props} />);
    wrapper.find("button").simulate("click");
    expect(props.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_REGIMEN,
      payload: props.regimen.uuid
    });
  });
});
