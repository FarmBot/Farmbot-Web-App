import React from "react";
import { render, act } from "@testing-library/react";
import { Sensors } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { SensorsProps } from "../interfaces";
import { fakeSensor } from "../../__test_support__/fake_state/resources";
import { clickButton } from "../../__test_support__/helpers";
import { SpecialStatus } from "farmbot";
import { error } from "../../toast/toast";

describe("<Sensors />", () => {
  function fakeProps(): SensorsProps {
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    fakeSensor1.body.pin = 1;
    fakeSensor2.body.pin = 2;
    return {
      bot,
      sensors: [fakeSensor1, fakeSensor2],
      dispatch: jest.fn(),
      disabled: false,
      firmwareHardware: undefined,
    };
  }

  it("renders", () => {
    const { container } = render(<Sensors {...fakeProps()} />);
    ["Sensors", "Edit", "Save", "Fake Pin", "1"].map(string =>
      expect(container.textContent).toContain(string));
    const saveButton = container.querySelectorAll("button")[1] as HTMLButtonElement;
    expect(saveButton.textContent).toContain("Save");
    expect(saveButton.hidden).toBeTruthy();
  });

  it("isEditing", () => {
    const ref = React.createRef<Sensors>();
    const { container } = render(<Sensors ref={ref} {...fakeProps()} />);
    expect(ref.current?.state.isEditing).toBeFalsy();
    clickButton(container, 0, "edit");
    expect(ref.current?.state.isEditing).toBeTruthy();
  });

  it("save attempt: pin number too small", () => {
    const p = fakeProps();
    p.sensors[0].body.pin = 1;
    p.sensors[1].body.pin = 1;
    p.sensors[0].specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Sensors {...p} />);
    clickButton(container, 1, "save", { partial_match: true });
    expect(error).toHaveBeenLastCalledWith("Pin numbers must be unique.");
  });

  it("saves", () => {
    const p = fakeProps();
    p.sensors[0].body.pin = 1;
    p.sensors[0].specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<Sensors {...p} />);
    clickButton(container, 1, "save", { partial_match: true });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds empty sensor", () => {
    const p = fakeProps();
    const ref = React.createRef<Sensors>();
    const { container } = render(<Sensors ref={ref} {...p} />);
    act(() => { ref.current?.setState({ isEditing: true }); });
    clickButton(container, 2, "");
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("adds stock sensors", () => {
    const p = fakeProps();
    const ref = React.createRef<Sensors>();
    const { container } = render(<Sensors ref={ref} {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("stock sensors");
    act(() => { ref.current?.setState({ isEditing: true }); });
    clickButton(container, 3, "stock sensors");
    const stockButton = container.querySelectorAll("button")[3] as HTMLButtonElement;
    expect(stockButton.hidden).toBeFalsy();
    expect(p.dispatch).toHaveBeenCalledTimes(2);
  });

  it("doesn't display + stock button", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const { container } = render(<Sensors {...p} />);
    const btn = container.querySelectorAll("button")[3] as HTMLButtonElement;
    expect(btn.textContent?.toLowerCase()).toContain("stock");
    expect(btn.hidden).toBeTruthy();
  });

  it("hides stock button", () => {
    const p = fakeProps();
    p.firmwareHardware = "none";
    const ref = React.createRef<Sensors>();
    const { container } = render(<Sensors ref={ref} {...p} />);
    act(() => { ref.current?.setState({ isEditing: true }); });
    const btn = container.querySelectorAll("button")[3] as HTMLButtonElement;
    expect(btn.textContent?.toLowerCase()).toContain("stock");
    expect(btn.hidden).toBeTruthy();
  });

  it("renders empty state", () => {
    const p = fakeProps();
    p.sensors = [];
    const { container } = render(<Sensors {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("no sensors yet");
  });

  it("doesn't render empty state", () => {
    const p = fakeProps();
    p.sensors = [];
    const ref = React.createRef<Sensors>();
    const { container } = render(<Sensors ref={ref} {...p} />);
    act(() => { ref.current?.setState({ isEditing: true }); });
    expect(container.textContent?.toLowerCase()).not.toContain("no sensors yet");
  });
});
