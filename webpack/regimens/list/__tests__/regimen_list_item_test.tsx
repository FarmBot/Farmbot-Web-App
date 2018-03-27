import * as React from "react";
import { RegimenListItemProps } from "../../interfaces";
import { RegimenListItem } from "../regimen_list_item";
import { render } from "enzyme";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";

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

  it("shows in-use indicator", () => {
    const props = fakeProps();
    props.regimen.body.in_use = true;
    const wrapper = render(<RegimenListItem {...props} />);
    expect(wrapper.find(".in-use").length).toEqual(1);
  });

  it("doesn't show in-use indicator", () => {
    const wrapper = render(<RegimenListItem {...fakeProps()} />);
    expect(wrapper.find(".in-use").length).toEqual(0);
  });
});
