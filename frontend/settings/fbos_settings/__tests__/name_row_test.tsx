jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
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
    const osSettings = mount<NameRow>(<NameRow {...p} />);
    shallow(osSettings.instance().NameInput())
      .simulate("change", { currentTarget: { value: newName } });
    expect(edit).toHaveBeenCalledWith(p.device, { name: newName });
  });

  it("saves bot name", () => {
    const p = fakeProps();
    const osSettings = mount<NameRow>(<NameRow {...p} />);
    shallow(osSettings.instance().NameInput()).simulate("blur");
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });
});
