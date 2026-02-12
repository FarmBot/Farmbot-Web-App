let mockOnlineValue = true;
import React from "react";
import { render } from "@testing-library/react";
import { botOnlineReq, ProductRegistration } from "../prerequisites";
import { WizardStepComponentProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { bot } from "../../__test_support__/fake_state/bot";
import * as wizardActions from "../actions";
import * as mustBeOnline from "../../devices/must_be_online";

let setOrderNumberSpy: jest.SpyInstance;

beforeEach(() => {
  setOrderNumberSpy = jest.spyOn(wizardActions, "setOrderNumber")
    .mockImplementation(jest.fn());
  jest.spyOn(mustBeOnline, "isBotOnlineFromState")
    .mockImplementation(() => mockOnlineValue);
});

afterEach(() => {
  mockOnlineValue = true;
  jest.restoreAllMocks();
});
describe("<ProductRegistration />", () => {
  const fakeProps = (): WizardStepComponentProps => ({
    setStepSuccess: jest.fn(() => jest.fn()),
    resources: buildResourceIndex([fakeDevice()]).index,
    bot: bot,
    dispatch: mockDispatch(),
    getConfigValue: jest.fn(),
  });

  it("updates value", () => {
    const registration =
      ProductRegistration(fakeProps()) as React.ReactElement<{ children?: React.ReactNode }>;
    const input = React.Children.toArray(registration.props.children)
      .find(child =>
        React.isValidElement<{ onCommit?: unknown }>(child)
        && typeof child.props.onCommit == "function");
    if (!input || !React.isValidElement(input)) {
      throw new Error("Expected order number input");
    }
    input.props.onCommit({
      currentTarget: { value: "123" },
    } as React.FocusEvent<HTMLInputElement>);
    expect(setOrderNumberSpy).toHaveBeenCalledWith(expect.any(Object), "123");
  });
});

describe("botOnlineReq()", () => {
  it("returns offline message", () => {
    mockOnlineValue = false;
    const { container } = render(<botOnlineReq.indicator />);
    expect(container.textContent?.toLowerCase()).toContain("unable");
  });

  it("returns online message", () => {
    mockOnlineValue = true;
    const { container } = render(<botOnlineReq.indicator />);
    expect(container.textContent?.toLowerCase()).not.toContain("unable");
  });
});
