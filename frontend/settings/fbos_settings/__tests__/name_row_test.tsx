jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { NameRow } from "../name_row";
import { NameRowProps } from "../interfaces";
import { edit, save } from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("<NameRow />", () => {
  const fakeProps = (): NameRowProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
  });

  it("changes bot name", () => {
    const p = fakeProps();
    const newName = "new bot name";
    render(<NameRow {...p} />);
    const input = screen.getByLabelText("name");
    fireEvent.change(input, { target: { value: newName } });
    expect(edit).toHaveBeenCalledWith(p.device, { name: newName });
  });

  it("saves bot name", () => {
    const p = fakeProps();
    p.device.body.name = "bot";
    render(<NameRow {...p} />);
    const input = screen.getByLabelText("name");
    fireEvent.blur(input);
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });
});
