let mockPatch = () => Promise.resolve();
jest.mock("axios", () => ({
  patch: jest.fn(() => mockPatch()),
}));

interface MockRef {
  current: { querySelectorAll(): [{ value: string }] } | undefined;
}
let mockRef: MockRef = { current: { querySelectorAll: () => [{ value: "" }] } };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRef,
}));

import React from "react";
import {
  cleanup, fireEvent, render, waitFor, within,
} from "@testing-library/react";
import { ChangePassword } from "../change_password";
import { API } from "../../../api/api";
import { error, success } from "../../../toast/toast";
import axios from "axios";

afterEach(() => {
  mockRef = { current: { querySelectorAll: () => [{ value: "" }] } };
  cleanup();
});

const setFields = (
  container: HTMLElement,
  password: string,
  newPassword: string,
  newPasswordConfirmation: string,
) => {
  const local = within(container);
  fireEvent.blur(local.getByLabelText("Old Password"),
    { target: { value: password } });
  fireEvent.blur(local.getByLabelText("New Password"),
    { target: { value: newPassword } });
  fireEvent.blur(local.getByLabelText("Confirm New Password"),
    { target: { value: newPasswordConfirmation } });
  expect(local.getAllByDisplayValue(password)[0]).toBeInTheDocument();
  const button = local.getByText("Save");
  fireEvent.click(button);
};

afterAll(() => {
  jest.unmock("axios");
  jest.unmock("react");
});
describe("<ChangePassword />", () => {
  it("rejects new == old password case", () => {
    const { container } = render(<ChangePassword />);
    setFields(container, "password", "password", "password");
    const expectation = expect.stringContaining("Password not changed");
    expect(error).toHaveBeenCalledWith(expectation);
  });

  it("rejects too short new password", () => {
    const { container } = render(<ChangePassword />);
    setFields(container, "a", "a", "a");
    const expectation = expect.stringContaining("New password must be at least");
    expect(error).toHaveBeenCalledWith(expectation);
  });

  it("rejects new != password confirmation case", () => {
    const { container } = render(<ChangePassword />);
    setFields(container, "aaaaaaaa", "bbbbbbbb", "cccccccc");
    const expectation = expect.stringContaining("do not match");
    expect(error).toHaveBeenCalledWith(expectation);
  });

  it("cancels password change", () => {
    window.confirm = () => false;
    const { container } = render(<ChangePassword />);
    setFields(container, "aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
    expect(axios.patch).not.toHaveBeenCalled();
  });

  it("handles missing ref", () => {
    mockRef = { current: undefined };
    window.confirm = () => false;
    const { container } = render(<ChangePassword />);
    setFields(container, "aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
    expect(axios.patch).not.toHaveBeenCalled();
  });

  describe("AJAX", () => {
    API.setBaseUrl("localhost");

    it("saves (KO)", async () => {
      mockPatch = () => Promise.reject({ response: { data: "error" } });
      window.confirm = () => true;
      const { container } = render(<ChangePassword />);
      setFields(container, "aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
      await waitFor(() => {
        expect(axios.patch).toHaveBeenCalledWith("http://localhost/api/users/",
          {
            password: "aaaaaaaa",
            new_password: "bbbbbbbb",
            new_password_confirmation: "bbbbbbbb",
          });
        expect(error).toHaveBeenCalledWith("Error: error");
        expect(success).not.toHaveBeenCalled();
      });
    });

    it("saves (OK)", async () => {
      mockPatch = () => Promise.resolve();
      window.confirm = () => true;
      const { container } = render(<ChangePassword />);
      setFields(container, "aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
      await waitFor(() => {
        expect(axios.patch).toHaveBeenCalledWith("http://localhost/api/users/",
          {
            password: "aaaaaaaa",
            new_password: "bbbbbbbb",
            new_password_confirmation: "bbbbbbbb",
          });
        expect(success).toHaveBeenCalledWith("Your password is changed.");
        expect(error).not.toHaveBeenCalled();
      });
    });
  });
});
