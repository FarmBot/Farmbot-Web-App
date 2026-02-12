import React from "react";
import { render } from "@testing-library/react";
import { BotPeripheralsProps, BotPeripherals } from "../bot_peripherals";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<BotPeripherals/>", () => {
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

  const fakeProps = (): BotPeripheralsProps => ({
    peripheralValues: [{ label: "", value: false }],
    position: { x: 0, y: 0, z: 0 },
    mapTransformProps: fakeMapTransformProps(),
    plantAreaOffset: { x: 100, y: 100 },
    getConfigValue: jest.fn(),
  });

  const renderPeripherals = (props: BotPeripheralsProps) =>
    render(<svg><BotPeripherals {...props} /></svg>);

  const getAttribute = (element: Element, key: string) =>
    element.getAttribute(key) ||
    element.getAttribute(key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`));

  const getNumericAttribute = (element: Element, key: string) => {
    const value = getAttribute(element, key);
    if (value === null || value === undefined) {
      throw new Error(`Missing attribute ${key}`);
    }
    return Number(value);
  };

  it.each<[string]>([
    ["lights"],
    ["vacuum"],
    ["water"],
    ["rotary"],
  ])("doesn't display %s", (peripheralName) => {
    const p = fakeProps();
    p.peripheralValues[0].label = peripheralName;
    p.peripheralValues[0].value = false;
    const { container } = renderPeripherals(p);
    expect(container.querySelectorAll(`#${peripheralName}`).length).toEqual(0);
  });

  function animationToggle(
    props: BotPeripheralsProps, enabled: number, disabled: number) {
    props.getConfigValue = () => false;
    const wrapperEnabled = renderPeripherals(props);
    expect(wrapperEnabled.container.querySelectorAll("use").length)
      .toEqual(enabled);

    props.getConfigValue = () => true;
    const wrapperDisabled = renderPeripherals(props);
    expect(wrapperDisabled.container.querySelectorAll("use").length)
      .toEqual(disabled);
  }

  it("displays light", () => {
    const p = fakeProps();
    p.peripheralValues[0].label = "lights";
    p.peripheralValues[0].value = true;
    const { container } = renderPeripherals(p);
    expect(container.querySelectorAll("#lights").length).toEqual(1);
    const rect = container.querySelectorAll("#lights rect")[0];
    expect(getAttribute(rect, "fill")).toEqual("url(#LightingGradient)");
    expect(getNumericAttribute(rect, "height")).toEqual(1700);
    expect(getNumericAttribute(rect, "width")).toEqual(400);
    expect(getNumericAttribute(rect, "x")).toEqual(0);
    expect(getNumericAttribute(rect, "y")).toEqual(-100);
    const lightUses = container.querySelectorAll("#lights use");
    expect(lightUses[0].getAttribute("xlink:href") ||
      lightUses[0].getAttribute("href")).toEqual("#light-half");
    expect(normalize(String(getAttribute(lightUses[0], "transform"))))
      .toEqual("rotate(0, 0, 750)");
    expect(lightUses[lightUses.length - 1].getAttribute("xlink:href") ||
      lightUses[lightUses.length - 1].getAttribute("href"))
      .toEqual("#light-half");
    expect(normalize(String(
      getAttribute(lightUses[lightUses.length - 1], "transform"))))
      .toEqual("rotate(180, 0, 750)");
  });

  it("displays light: X&Y swapped", () => {
    const p = fakeProps();
    p.peripheralValues[0].label = "lights";
    p.peripheralValues[0].value = true;
    p.mapTransformProps.xySwap = true;
    const { container } = renderPeripherals(p);
    expect(container.querySelectorAll("#lights").length).toEqual(1);
    const rect = container.querySelectorAll("#lights rect")[0];
    expect(getAttribute(rect, "fill")).toEqual("url(#LightingGradient)");
    expect(getNumericAttribute(rect, "height")).toEqual(1700);
    expect(getNumericAttribute(rect, "width")).toEqual(400);
    expect(getNumericAttribute(rect, "x")).toEqual(-100);
    expect(getNumericAttribute(rect, "y")).toEqual(0);
    const lightUses = container.querySelectorAll("#lights use");
    expect(lightUses[0].getAttribute("xlink:href") ||
      lightUses[0].getAttribute("href")).toEqual("#light-half");
    expect(normalize(String(getAttribute(lightUses[0], "transform"))))
      .toEqual("rotate(90, 750, 850)");
    expect(lightUses[lightUses.length - 1].getAttribute("xlink:href") ||
      lightUses[lightUses.length - 1].getAttribute("href"))
      .toEqual("#light-half");
    expect(normalize(String(
      getAttribute(lightUses[lightUses.length - 1], "transform"))))
      .toEqual("rotate(270, -100, 0)");
  });

  it("displays water", () => {
    const p = fakeProps();
    p.peripheralValues[0].label = "water valve";
    p.peripheralValues[0].value = true;
    const { container } = renderPeripherals(p);
    expect(container.querySelectorAll("#water").length).toEqual(1);
    const circle = container.querySelectorAll("#water circle")[0];
    expect(getNumericAttribute(circle, "cx")).toEqual(0);
    expect(getNumericAttribute(circle, "cy")).toEqual(0);
    expect(getAttribute(circle, "fill")).toEqual("rgb(11, 83, 148)");
    expect(getNumericAttribute(circle, "fillOpacity")).toEqual(0.2);
    expect(getNumericAttribute(circle, "r")).toEqual(55);
    animationToggle(p, 75, 25);
  });

  it("displays vacuum", () => {
    const p = fakeProps();
    p.peripheralValues[0].label = "vacuum pump";
    p.peripheralValues[0].value = true;
    const { container } = renderPeripherals(p);
    expect(container.querySelectorAll("#vacuum").length).toEqual(1);
    const circle = container.querySelectorAll("#vacuum circle")[0];
    expect(getAttribute(circle, "fill")).toEqual("url(#WaveGradient)");
    expect(getNumericAttribute(circle, "cx")).toEqual(0);
    expect(getNumericAttribute(circle, "cy")).toEqual(0);
    expect(getNumericAttribute(circle, "r")).toEqual(100);
    animationToggle(p, 3, 1);
  });

  it("displays rotary", () => {
    const p = fakeProps();
    p.peripheralValues[0].label = "rotary tool";
    p.peripheralValues[0].value = true;
    const { container } = renderPeripherals(p);
    expect(container.querySelectorAll("#rotary").length).toEqual(1);
    const circle = container.querySelectorAll("#rotary circle")[0];
    expect(getAttribute(circle, "fill")).toEqual("url(#WaveGradient)");
    expect(getNumericAttribute(circle, "cx")).toEqual(0);
    expect(getNumericAttribute(circle, "cy")).toEqual(0);
    expect(getNumericAttribute(circle, "r")).toEqual(100);
    animationToggle(p, 3, 1);
  });
});
