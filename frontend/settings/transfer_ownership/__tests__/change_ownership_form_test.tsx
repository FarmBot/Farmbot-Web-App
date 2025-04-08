const mockDevice = { send: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../transfer_ownership/transfer_ownership", () => ({
  transferOwnership: jest.fn(() => Promise.resolve()),
}));

interface MockRef {
  current: { value: string } | undefined;
}
let mockRef: MockRef = { current: { value: "" } };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRef,
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChangeOwnershipForm } from "../change_ownership_form";
import { transferOwnership } from "../transfer_ownership";
import { API } from "../../../api";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";

describe("<ChangeOwnershipForm />", () => {
  beforeEach(() => API.setBaseUrl("https://my.farm.bot"));

  it("renders", () => {
    render(<ChangeOwnershipForm />);
    const header = screen.getByText("Change Ownership");
    fireEvent.click(header);
    ["Email", "Password", "Server"]
      .map(string => expect(screen.getByLabelText(string)).toBeInTheDocument());
  });

  it("submits", () => {
    render(<ChangeOwnershipForm />);
    const header = screen.getByText("Change Ownership");
    fireEvent.click(header);
    const email = screen.getByLabelText("Email");
    changeBlurableInputRTL(email, "email");
    const password = screen.getByLabelText("Password");
    changeBlurableInputRTL(password, "password");
    fireEvent.click(screen.getByText("submit"));
    expect(transferOwnership).toHaveBeenCalledWith({
      device: mockDevice,
      email: "email",
      password: "password",
    });
  });

  it("handles missing ref", () => {
    mockRef = { current: undefined };
    render(<ChangeOwnershipForm />);
    const header = screen.getByText("Change Ownership");
    fireEvent.click(header);
    const email = screen.getByLabelText("Email");
    changeBlurableInputRTL(email, "email");
    const password = screen.getByLabelText("Password");
    changeBlurableInputRTL(password, "password");
    fireEvent.click(screen.getByText("submit"));
    expect(transferOwnership).toHaveBeenCalledWith({
      device: mockDevice,
      email: "email",
      password: "password",
    });
  });
});
