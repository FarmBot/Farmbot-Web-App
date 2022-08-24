jest.mock("../../../toast_errors", () => ({ toastErrors: jest.fn() }));

let mockPost = Promise.resolve();
let mockDelete = Promise.resolve();
jest.mock("axios", () => ({
  post: jest.fn(() => mockPost),
  delete: jest.fn(() => mockDelete),
}));

import { API } from "../../../api/api";
import { deleteUser, resetAccount } from "../actions";
import { toastErrors } from "../../../toast_errors";
import axios from "axios";

API.setBaseUrl("http://localhost:3000");
const data = { password: "Foo!" };
const errorResponse = { response: { data: "error" } };

describe("deleteUser()", () => {
  it("deletes user", async () => {
    mockDelete = Promise.resolve();
    window.alert = jest.fn();
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    await deleteUser(data)(dispatch, getState);
    expect(axios.delete).toHaveBeenCalledWith("http://localhost:3000/api/users/",
      { data, params: { force: true } });
    expect(toastErrors).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith("We're sorry to see you go. :(");
  });

  it("doesn't delete user", async () => {
    mockDelete = Promise.reject(errorResponse);
    window.alert = jest.fn();
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    await deleteUser(data)(dispatch, getState);
    await expect(axios.delete).toHaveBeenCalledWith(
      "http://localhost:3000/api/users/",
      { data, params: { force: true } });
    expect(toastErrors).toHaveBeenCalledWith({ err: errorResponse });
    expect(alert).not.toHaveBeenCalled();
  });
});

describe("resetAccount()", () => {
  it("resets account", async () => {
    mockPost = Promise.resolve();
    window.alert = jest.fn();
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    await resetAccount(data)(dispatch, getState);
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/device/reset", data);
    expect(toastErrors).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith("Account has been reset.");
  });

  it("doesn't reset account", async () => {
    mockPost = Promise.reject(errorResponse);
    window.alert = jest.fn();
    const dispatch = jest.fn();
    const getState = jest.fn();
    getState.mockImplementation(() => ({ auth: {} }));
    await resetAccount(data)(dispatch, getState);
    expect(axios.post).toHaveBeenCalledWith(
      "http://localhost:3000/api/device/reset", data);
    expect(toastErrors).toHaveBeenCalledWith({ err: errorResponse });
    expect(alert).not.toHaveBeenCalled();
  });
});
