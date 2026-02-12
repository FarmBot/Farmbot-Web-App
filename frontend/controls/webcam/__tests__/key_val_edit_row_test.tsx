import React from "react";
import { render } from "@testing-library/react";
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
    const { container } = render(<KeyValEditRow {...fakeProps()} />);
    const input = container.querySelector("input[name='label']");
    expect((input as HTMLInputElement)?.value).toEqual("label");
  });
});
