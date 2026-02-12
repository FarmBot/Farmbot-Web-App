let mockOnlineValue = true;
import React from "react";
import { render } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
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
    const wrapper = TestRenderer.create(<ProductRegistration {...fakeProps()} />);
    const input = wrapper.root.findByType("input");
    input.props.onBlur({ currentTarget: { value: "123" } });
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
