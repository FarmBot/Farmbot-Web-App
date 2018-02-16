jest.mock("../../../resources/selectors", () => {
  return {
    maybeDetermineUuid: jest.fn(() => "FAKE_UUID")
  };
});

import * as React from "react";
import { shallow } from "enzyme";
import { StepCheckBox, getPeripheralId, selectedItem } from "../pin_and_peripheral_support";
import { SequenceBodyItem } from "farmbot";
import { maybeDetermineUuid } from "../../../resources/selectors";

describe("StepCheckBox", () => {
  it("renders", () => {
    const onClick = jest.fn();
    const el = shallow(<StepCheckBox onClick={onClick}>
      Hello, World
    </StepCheckBox>);
    expect(el.text()).toContain("Hello, World");
    expect(el.find("input").prop("checked")).toBe(false);
    el.find("input").first().simulate("change");
    expect(onClick).toHaveBeenCalled();
  });
});

describe("getPeripheralId", () => {
  it("returns peripheral ID", () => {
    const x: SequenceBodyItem[] = [{
      kind: "read_peripheral",
      args: {
        peripheral_id: 1,
        pin_mode: 2
      }
    }, {
      kind: "write_peripheral",
      args: {
        peripheral_id: 1,
        pin_mode: 0,
        pin_value: 1
      }
    }];
    x.map(s => expect(getPeripheralId(s)).toBe(1));
    const crash =
      () => getPeripheralId({ kind: "wait", args: { milliseconds: 0 } });
    expect(crash).toThrowError();
  });

});

describe("selectedItem", () => {
  it("gets peripheral by ID", () => {
    const fakeResources = {
      references: {
        "FAKE_UUID": {
          kind: "Peripheral",
          body: {
            label: "hello",
            id: undefined
          }
        }
      }
    } as any
    expect(selectedItem(1, fakeResources)).toEqual({ label: "hello", value: 0 });
    expect(maybeDetermineUuid).toHaveBeenCalled();
  });
});
