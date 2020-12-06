import React from "react";
import { mount } from "enzyme";
import { KeyValEditRow, KeyValEditRowProps } from "../key_val_edit_row";

describe("<KeyValEditRow />", () => {
  const fakeProps = (): KeyValEditRowProps => ({
    label: "label",
    labelPlaceholder: "",
    value: "value",
    valuePlaceholder: "",
    onClick: jest.fn(),
    disabled: false,
    onLabelChange: jest.fn(),
    onValueChange: jest.fn(),
    valueType: "number",
  });

  it("renders", () => {
    const wrapper = mount(<KeyValEditRow {...fakeProps()} />);
    expect(wrapper.find("input").first().props().value).toEqual("label");
  });
});
