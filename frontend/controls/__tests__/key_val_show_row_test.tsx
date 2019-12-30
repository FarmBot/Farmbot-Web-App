import * as React from "react";
import { mount } from "enzyme";
import { KeyValShowRow, KeyValRowProps } from "../key_val_show_row";

describe("<KeyValShowRow />", () => {
  const fakeProps = (): KeyValRowProps => ({
    label: "label",
    labelPlaceholder: "",
    value: "value",
    valuePlaceholder: "",
    onClick: jest.fn(),
    disabled: false,
  });

  it("renders", () => {
    const wrapper = mount(<KeyValShowRow {...fakeProps()} />);
    expect(wrapper.text()).toContain("label");
    expect(wrapper.text()).toContain("value");
  });
});
