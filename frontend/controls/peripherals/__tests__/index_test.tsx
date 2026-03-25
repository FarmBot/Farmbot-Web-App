import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Peripherals } from "../index";
import { bot } from "../../../__test_support__/fake_state/bot";
import { PeripheralsProps } from "../interfaces";
import { fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus, FirmwareHardware } from "farmbot";
import { error } from "../../../toast/toast";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<Peripherals />", () => {
  const fakeProps = (): PeripheralsProps => ({
    bot,
    peripherals: [fakePeripheral()],
    dispatch: jest.fn(),
    firmwareHardware: undefined,
    resources: buildResourceIndex([]).index,
    getConfigValue: () => false,
  });

  it("renders", () => {
    const { container } = render(<Peripherals {...fakeProps()} />);
    ["Edit", "Save", "Fake Pin", "1"].map(string =>
      expect(container.textContent).toContain(string));
    const saveButton =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      container.querySelector("button[title='save']") as HTMLButtonElement | null;
    expect(saveButton?.textContent).toContain("Save");
    expect(saveButton?.hidden).toBeTruthy();
  });

  it("isEditing", () => {
    const { container } = render(<Peripherals {...fakeProps()} />);
    const editButton = container.querySelector("button[title='Edit']");
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const addButton = container.querySelector(
      "button[title='add peripheral']") as HTMLButtonElement | null;
    expect(addButton?.hidden)
      .toBeTruthy();
    editButton && fireEvent.click(editButton);
    expect(addButton?.hidden)
      .toBeFalsy();
  });

  it("save attempt: pin number undefined", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = undefined;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Peripherals {...p} />);
    const saveButton = container.querySelector("button[title='save']");
    saveButton && fireEvent.click(saveButton);
    expect(error).toHaveBeenLastCalledWith("Please select a pin.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("save attempt: pin number not unique", () => {
    const p = fakeProps();
    p.peripherals = [fakePeripheral(), fakePeripheral()];
    p.peripherals[0].body.pin = 1;
    p.peripherals[1].body.pin = 1;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Peripherals {...p} />);
    const saveButton = container.querySelector("button[title='save']");
    saveButton && fireEvent.click(saveButton);
    expect(error).toHaveBeenLastCalledWith("Pin numbers must be unique.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("saves", () => {
    const p = fakeProps();
    p.peripherals[0].body.pin = 1;
    p.peripherals[0].specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Peripherals {...p} />);
    const saveButton = container.querySelector("button[title='save']");
    saveButton && fireEvent.click(saveButton);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds empty peripheral", () => {
    const p = fakeProps();
    const { container } = render(<Peripherals {...p} />);
    const editButton = container.querySelector("button[title='Edit']");
    editButton && fireEvent.click(editButton);
    const addButton = container.querySelector("button[title='add peripheral']");
    addButton && fireEvent.click(addButton);
    expect(p.dispatch).toHaveBeenCalled();
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 2],
    ["farmduino", 5],
    ["farmduino_k14", 5],
    ["farmduino_k15", 5],
    ["farmduino_k16", 7],
    ["farmduino_k17", 7],
    ["farmduino_k18", 7],
    ["express_k10", 3],
    ["express_k11", 3],
    ["express_k12", 3],
  ])("adds peripherals: %s", (firmware, expectedAdds) => {
    const p = fakeProps();
    p.firmwareHardware = firmware;
    const { container } = render(<Peripherals {...p} />);
    const editButton = container.querySelector("button[title='Edit']");
    editButton && fireEvent.click(editButton);
    const stockButton = container.querySelector(
      "button[title='add stock peripherals']");
    stockButton && fireEvent.click(stockButton);
    expect(p.dispatch).toHaveBeenCalledTimes(expectedAdds);
  });

  it("hides stock button", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const { container } = render(<Peripherals {...p} />);
    const editButton = container.querySelector("button[title='Edit']");
    editButton && fireEvent.click(editButton);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const stockButton = container.querySelector(
      "button[title='add stock peripherals']") as HTMLButtonElement | null;
    expect(stockButton?.textContent?.toLowerCase()).toContain("stock");
    expect(stockButton?.hidden).toBeTruthy();
  });

  it("renders empty state", () => {
    const p = fakeProps();
    p.peripherals = [];
    const { container } = render(<Peripherals {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("no peripherals yet");
  });

  it("doesn't render empty state", () => {
    const p = fakeProps();
    p.peripherals = [];
    const { container } = render(<Peripherals {...p} />);
    const editButton = container.querySelector("button[title='Edit']");
    editButton && fireEvent.click(editButton);
    expect(container.textContent?.toLowerCase()).not.toContain("no peripherals yet");
  });
});
