import React from "react";
import { render } from "@testing-library/react";
import { PeripheralForm } from "../peripheral_form";
import { TaggedPeripheral, SpecialStatus } from "farmbot";
import { PeripheralFormProps } from "../interfaces";

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
    const firstRowPin = rows[0]?.querySelector(".filter-search button");
    const secondRowPin = rows[1]?.querySelector(".filter-search button");
    expect(firstRowPin?.textContent).toContain("Pin 2");
    expect(secondRowPin?.textContent).toContain("Pin 13");
  });
});
