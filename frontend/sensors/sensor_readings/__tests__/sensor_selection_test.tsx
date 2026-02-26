import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { SensorSelection } from "../sensor_selection";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";
import { SensorSelectionProps } from "../interfaces";
import * as ui from "../../../ui";

let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem?: { label?: string };
      list?: { value: string }[];
      onChange: (ddi: { label: string; value: string }) => void;
    }) =>
      <button className="fb-select-mock"
        onClick={() =>
          props.onChange({ label: "", value: props.list?.[0]?.value ?? "" })}>
        {props.selectedItem?.label}
      </button>);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("<SensorSelection />", () => {
  const fakeProps = (): SensorSelectionProps => ({
    selectedSensor: undefined,
    sensors: [],
    setSensor: jest.fn(),
    allOption: true,
  });

  it("renders", () => {
    const { container } = render(<SensorSelection {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["sensor", "all"]
      .map(string => expect(txt).toContain(string));
  });

  it("renders selected sensor", () => {
    const s = fakeSensor();
    const p = fakeProps();
    p.selectedSensor = s;
    p.sensors = [s];
    const { container } = render(<SensorSelection {...p} />);
    expect(container.textContent).toContain(s.body.label);
  });

  it("selects sensor", () => {
    const s = fakeSensor();
    const p = fakeProps();
    p.sensors = [s];
    const { container } = render(<SensorSelection {...p} />);
    fireEvent.click(container.querySelector(".fb-select-mock") as Element);
    expect(p.setSensor).toHaveBeenCalledWith(s);
  });
});
