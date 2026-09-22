import React from "react";
import { render } from "@testing-library/react";
import {
  PeripheralForm, PeripheralTypeDropdown,
} from "../peripheral_form";
import { TaggedPeripheral, SpecialStatus } from "farmbot";
import { PeripheralFormProps } from "../interfaces";
import { Actions } from "../../../constants";

describe("<PeripheralForm/>", () => {
  const dispatch = jest.fn();
  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "Peripheral.2.2",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED",
        mode: 0,
        type: "lighting",
      }
    },
    {
      uuid: "Peripheral.1.1",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2",
        mode: 0,
        type: "none",
      }
    },
  ];
  const fakeProps = (): PeripheralFormProps => ({ dispatch, peripherals });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a list of editable peripherals, in sorted order", () => {
    const { container } = render(<PeripheralForm {...fakeProps()} />);
    const names = Array.from(container.querySelectorAll("input[name='pinName']"));
    expect((names[0] as HTMLInputElement)?.value).toEqual("GPIO 2");
    expect((names[1] as HTMLInputElement)?.value).toEqual("GPIO 13 - LED");
    const rows = Array.from(container.querySelectorAll(".peripheral-edit-grid"));
    const firstRowText = (rows[0]?.textContent || "").toLowerCase();
    const secondRowText = (rows[1]?.textContent || "").toLowerCase();
    expect(firstRowText).toMatch(/pin\s*2|\b2\b/);
    expect(secondRowText).toMatch(/pin\s*13|\b13\b/);
  });

  it("updates the peripheral type", () => {
    const peripheral = peripherals[0];
    const dropdown = PeripheralTypeDropdown({ dispatch, peripheral });
    expect(dropdown.props.list.map((item: { value: string }) => item.value))
      .toEqual([
        "lighting", "rotary_tool", "vacuum", "water", "none",
      ]);
    expect(dropdown.props.selectedItem)
      .toEqual({ label: "Lighting", value: "lighting" });
    dropdown.props.onChange({ label: "Vacuum", value: "vacuum" });
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.EDIT_RESOURCE,
      payload: expect.objectContaining({
        uuid: peripheral.uuid,
        update: { type: "vacuum" },
      }),
    }));
  });
});
