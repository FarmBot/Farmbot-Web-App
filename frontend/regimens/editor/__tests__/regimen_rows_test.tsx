jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import { RegimenRows } from "../regimen_rows";
import { RegimenRowsProps } from "../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { overwrite } from "../../../api/crud";
import { VariableDeclaration } from "farmbot";

const testVariable: VariableDeclaration = {
  kind: "variable_declaration",
  args: {
    label: "variable", data_value: {
      kind: "coordinate", args: { x: 1, y: 2, z: 3 }
    }
  }
};

describe("<RegimenRows />", () => {
  const fakeProps = (): RegimenRowsProps => {
    const regimen = fakeRegimen();
    return {
      regimen: fakeRegimen(),
      calendar: [{
        day: "1",
        items: [{
          sequenceName: "Item 0",
          color: "red",
          hhmm: "10:00",
          sortKey: 0,
          day: 1,
          dispatch: jest.fn(),
          regimen: regimen,
          item: {
            sequence_id: 0, time_offset: 1000
          },
          variables: [undefined],
        }]
      }],
      dispatch: jest.fn(),
      resources: buildResourceIndex([]).index,
    };
  };

  it("renders", () => {
    const wrapper = mount(<RegimenRows {...fakeProps()} />);
    ["Day", "Item 0", "10:00"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("removes regimen item", () => {
    const keptItem = { sequence_id: 1, time_offset: 1000 };
    const p = fakeProps();
    p.calendar[0].items[0].regimen.body.regimen_items =
      [p.calendar[0].items[0].item, keptItem];
    const wrapper = mount(<RegimenRows {...p} />);
    wrapper.find("i").last().simulate("click");
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ regimen_items: [keptItem] }));
  });

  it("shows location variable label: coordinate", () => {
    const p = fakeProps();
    p.calendar[0].items[0].regimen.body.body = [testVariable];
    p.calendar[0].items[0].variables = [testVariable.args.label];
    const wrapper = mount(<RegimenRows {...p} />);
    expect(wrapper.find(".regimen-event-variable").text())
      .toEqual("variable - Coordinate (1, 2, 3)");
  });

  it("doesn't show location variable label", () => {
    const p = fakeProps();
    p.calendar[0].items[0].regimen.body.body = [];
    p.calendar[0].items[0].variables = ["variable"];
    const wrapper = mount(<RegimenRows {...p} />);
    expect(wrapper.find(".regimen-event-variable").length).toEqual(0);
  });
});
