import React from "react";
import { render } from "@testing-library/react";
import { WateringAnimations } from "../watering_animations";

jest.mock("@react-three/drei", () => ({
  Cloud: ({ position }: { position: number[] }) => (
    <div data-testid="mock-cloud" data-test-position={position.join(",")} />
  ),
  Clouds: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-clouds">{children}</div>
  ),
}));

jest.mock("../water_stream", () => ({
  WaterStream: ({ name }: { name: string }) => (
    <div data-testid="mock-water-stream" data-name={name} />
  ),
}));

jest.mock("../../components", () => ({
  Group: ({
    children,
    visible,
    name,
    ...rest
  }: {
    children: React.ReactNode;
    visible: boolean;
    name: string;
  }) => (
    <div data-visible={visible ? "true" : "false"} data-name={name} {...rest}>
      {children}
    </div>
  ),
}));

describe("<WateringAnimations />", () => {
  const fakeProps = {
    waterFlow: true,
    botPositionZ: 100,
    soilHeight: 0,
  };

  it("calculates correct nozzle to soil distance", () => {
    const props = {
      ...fakeProps,
      botPositionZ: 200,
      soilHeight: 50,
    };
    const { container } = render(<WateringAnimations {...props} />);
    const clouds = container.querySelectorAll('[data-testid="mock-cloud"]');

    expect(clouds[0]).toHaveAttribute("data-test-position", "0,0,35");
    expect(clouds[1]).toHaveAttribute("data-test-position", "0,0,190");
  });

  it("renders water streams with correct names", () => {
    const { container } = render(<WateringAnimations {...fakeProps} />);
    const waterStreams = container.querySelectorAll(
      '[data-testid="mock-water-stream"]'
    );

    expect(waterStreams[0]).toHaveAttribute("data-name", "water-stream-0");
    expect(waterStreams[15]).toHaveAttribute("data-name", "water-stream-15");
  });
});
