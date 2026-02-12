import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ChangeOwnershipForm } from "../change_ownership_form";
import * as transferOwnershipModule from "../transfer_ownership";
import * as device from "../../../device";
import { API } from "../../../api";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";

describe("<ChangeOwnershipForm />", () => {
  const mockDevice = { send: jest.fn(() => Promise.resolve()) };
  let transferOwnershipSpy: jest.SpyInstance;
  let getDeviceSpy: jest.SpyInstance;

  beforeEach(() => {
    API.setBaseUrl("https://my.farm.bot");
    window.history.pushState({}, "", "/app/designer/settings");
    transferOwnershipSpy = jest.spyOn(transferOwnershipModule, "transferOwnership")
      .mockImplementation(jest.fn(() => Promise.resolve()));
    getDeviceSpy = jest.spyOn(device, "getDevice").mockImplementation(() => mockDevice as never);
  });

  afterEach(() => {
    transferOwnershipSpy.mockRestore();
    getDeviceSpy.mockRestore();
    cleanup();
  });

  it("renders", () => {
    const { getByRole, container } = render(<ChangeOwnershipForm />);
    const header = getByRole("button", { name: /Change Ownership/, hidden: true });
    fireEvent.click(header);
    expect(container.textContent).toContain("Email");
    expect(container.textContent).toContain("Password");
    expect(container.textContent).toContain("Server");
    expect(container.querySelectorAll("input").length).toBeGreaterThanOrEqual(3);
  });

  it("submits", () => {
    const { getByRole, getByText, container } = render(<ChangeOwnershipForm />);
    const header = getByRole("button", { name: /Change Ownership/, hidden: true });
    fireEvent.click(header);
    const email = container.querySelectorAll("input")[0];
    expect(email).toBeTruthy();
    changeBlurableInputRTL(email, "email");
    const password = container.querySelector("#password")
      || container.querySelectorAll("input")[1];
    expect(password).toBeTruthy();
    fireEvent.blur(password, {
      target: { value: "password" },
      currentTarget: { value: "password" },
    });
    fireEvent.click(getByText("submit"));
    expect(transferOwnershipSpy).toHaveBeenCalledWith({
      device: mockDevice,
      email: "email",
      password: "password",
    });
  });

  it("handles missing ref", () => {
    const useRefSpy = jest.spyOn(React, "useRef").mockReturnValue({ current: undefined });
    try {
      const { getByRole, getByText, container } = render(<ChangeOwnershipForm />);
      const header = getByRole("button", { name: /Change Ownership/, hidden: true });
      fireEvent.click(header);
      const email = container.querySelectorAll("input")[0];
      expect(email).toBeTruthy();
      changeBlurableInputRTL(email, "email");
      const password = container.querySelector("#password")
        || container.querySelectorAll("input")[1];
      expect(password).toBeTruthy();
      fireEvent.blur(password, {
        target: { value: "password" },
        currentTarget: { value: "password" },
      });
      fireEvent.click(getByText("submit"));
      expect(transferOwnershipSpy).toHaveBeenCalledWith({
        device: mockDevice,
        email: "email",
        password: "password",
      });
    } finally {
      useRefSpy.mockRestore();
    }
  });
});
