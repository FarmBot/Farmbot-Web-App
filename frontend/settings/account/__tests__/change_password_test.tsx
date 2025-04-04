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
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChangePassword } from "../change_password";
import { API } from "../../../api/api";
import { error, success } from "../../../toast/toast";
import axios from "axios";

const setFields = (
  password: string,
  newPassword: string,
  newPasswordConfirmation: string,
) => {
  fireEvent.blur(screen.getByLabelText("Old Password"),
    { target: { value: password } });
  fireEvent.blur(screen.getByLabelText("New Password"),
    { target: { value: newPassword } });
  fireEvent.blur(screen.getByLabelText("Confirm New Password"),
    { target: { value: newPasswordConfirmation } });
  expect(screen.getAllByDisplayValue(password)[0]).toBeInTheDocument();
  const button = screen.getByText("Save");
  fireEvent.click(button);
};

describe("<ChangePassword />", () => {
  it("rejects new == old password case", () => {
    render(<ChangePassword />);
    setFields("password", "password", "password");
    const expectation = expect.stringContaining("Password not changed");
    expect(error).toHaveBeenCalledWith(expectation);
  });

  it("rejects too short new password", () => {
    render(<ChangePassword />);
    setFields("a", "a", "a");
    const expectation = expect.stringContaining("New password must be at least");
    expect(error).toHaveBeenCalledWith(expectation);
  });

  it("rejects new != password confirmation case", () => {
    render(<ChangePassword />);
    setFields("aaaaaaaa", "bbbbbbbb", "cccccccc");
    const expectation = expect.stringContaining("do not match");
    expect(error).toHaveBeenCalledWith(expectation);
  });

  it("cancels password change", () => {
    window.confirm = () => false;
    render(<ChangePassword />);
    setFields("aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
    expect(axios.patch).not.toHaveBeenCalled();
  });

  it("handles missing ref", () => {
    mockRef = { current: undefined };
    window.confirm = () => false;
    render(<ChangePassword />);
    setFields("aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
    expect(axios.patch).not.toHaveBeenCalled();
  });

  describe("AJAX", () => {
    API.setBaseUrl("localhost");

    it("saves (KO)", async () => {
      mockPatch = () => Promise.reject({ response: { data: "error" } });
      window.confirm = () => true;
      render(<ChangePassword />);
      setFields("aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
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
      render(<ChangePassword />);
      setFields("aaaaaaaa", "bbbbbbbb", "bbbbbbbb");
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
