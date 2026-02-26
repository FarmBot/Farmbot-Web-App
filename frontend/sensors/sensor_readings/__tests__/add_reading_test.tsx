import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import { AddSensorReadingMenu, AddSensorReadingMenuProps } from "../add_reading";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { error } from "../../../toast/toast";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";
import { PinMode } from "../../../sequences/step_tiles/pin_support";
import * as ui from "../../../ui";

const blurableInputMock = jest.fn((props: {
  className?: string,
  value?: string | number,
  type?: string,
  name?: string,
  onCommit: (event: React.FormEvent<HTMLInputElement>) => void,
}) =>
  <input
    className={props.className}
    defaultValue={props.value as string | undefined}
    type={props.type}
    name={props.name}
    onBlur={e => props.onCommit(e)}
    onChange={() => { }} />,
);

let blurableInputSpy: jest.SpyInstance;

describe("<AddSensorReadingMenu />", () => {
  const fakeProps = (): AddSensorReadingMenuProps => ({
    dispatch: jest.fn(),
    sensors: [fakeSensor()],
    closeMenu: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  const renderWithRef = (props: AddSensorReadingMenuProps) => {
    const ref = React.createRef<AddSensorReadingMenu>();
    const utils = render(<AddSensorReadingMenu ref={ref} {...props} />);
    expect(ref.current).toBeTruthy();
    return { ...utils, ref };
  };

  beforeEach(() => {
    blurableInputMock.mockClear();
    blurableInputSpy = jest.spyOn(ui, "BlurableInput")
      .mockImplementation((props: unknown) => blurableInputMock(props as never));
  });

  afterEach(() => {
    blurableInputSpy.mockRestore();
  });

  it("changes sensor", () => {
    const sensor = fakeSensor();
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ sensor }); });
    expect(ref.current?.state.sensor).toEqual(sensor);
  });

  it("changes date", () => {
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ date: "" }); });
    expect(ref.current?.state.date).toEqual("");
  });

  it("changes time", () => {
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ time: "" }); });
    expect(ref.current?.state.time).toEqual("");
  });

  it("changes x", () => {
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ x: 1 }); });
    expect(ref.current?.state.x).toEqual(1);
  });

  it("changes y", () => {
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ y: 1 }); });
    expect(ref.current?.state.y).toEqual(1);
  });

  it("changes z", () => {
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ z: 1 }); });
    expect(ref.current?.state.z).toEqual(1);
  });

  it("changes value", () => {
    const { ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ value: 1 }); });
    expect(ref.current?.state.value).toEqual(1);
  });

  it("doesn't add reading: no sensor", () => {
    const { container } = render(<AddSensorReadingMenu {...fakeProps()} />);
    fireEvent.click(container.querySelector("button.fb-button.green") as Element);
    expect(error).toHaveBeenCalledWith(
      "Please select a sensor with a valid pin number.");
  });

  it("doesn't add reading: no sensor pin", () => {
    const { container, ref } = renderWithRef(fakeProps());
    const sensor = fakeSensor();
    sensor.body.pin = undefined;
    act(() => { ref.current?.setState({ sensor }); });
    fireEvent.click(container.querySelector("button.fb-button.green") as Element);
    expect(error).toHaveBeenCalledWith(
      "Please select a sensor with a valid pin number.");
  });

  it("doesn't add reading: no value", () => {
    const { container, ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ sensor: fakeSensor() }); });
    fireEvent.click(container.querySelector("button.fb-button.green") as Element);
    expect(error).toHaveBeenCalledWith("Please enter a value.");
  });

  it("doesn't add reading: bad analog value", () => {
    const { container, ref } = renderWithRef(fakeProps());
    const sensor = fakeSensor();
    sensor.body.mode = PinMode.analog;
    act(() => { ref.current?.setState({ sensor, value: 2000 }); });
    fireEvent.click(container.querySelector("button.fb-button.green") as Element);
    expect(error).toHaveBeenCalledWith(
      "Please enter a value between 0 and 1023");
  });

  it("doesn't add reading: bad digital value", () => {
    const { container, ref } = renderWithRef(fakeProps());
    const sensor = fakeSensor();
    sensor.body.mode = PinMode.digital;
    act(() => { ref.current?.setState({ sensor, value: 2 }); });
    fireEvent.click(container.querySelector("button.fb-button.green") as Element);
    expect(error).toHaveBeenCalledWith(
      "Please enter a value between 0 and 1");
  });

  it("adds reading", () => {
    const { container, ref } = renderWithRef(fakeProps());
    act(() => { ref.current?.setState({ sensor: fakeSensor(), value: 1 }); });
    fireEvent.click(container.querySelector("button.fb-button.green") as Element);
    expect(error).not.toHaveBeenCalled();
  });
});
