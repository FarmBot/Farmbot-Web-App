let mockPost = Promise.resolve();
let mockDelete = Promise.resolve();

import { API } from "../../../api/api";
import { deleteUser, resetAccount } from "../actions";
import * as toastErrorsModule from "../../../toast_errors";
import axios from "axios";

let toastErrorsSpy: jest.SpyInstance;
let axiosPostSpy: jest.SpyInstance;
let axiosDeleteSpy: jest.SpyInstance;

API.setBaseUrl("http://localhost:3000");
const data = { password: "Foo!" };
const errorResponse = { response: { data: "error" } };

beforeEach(() => {
  toastErrorsSpy = jest.spyOn(toastErrorsModule, "toastErrors")
    .mockImplementation(jest.fn());
  axiosPostSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => mockPost);
  axiosDeleteSpy = jest.spyOn(axios, "delete")
    .mockImplementation(() => mockDelete);
});

afterEach(() => {
  toastErrorsSpy.mockRestore();
  axiosPostSpy.mockRestore();
  axiosDeleteSpy.mockRestore();
});
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
    expect(toastErrorsSpy).not.toHaveBeenCalled();
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
    expect(toastErrorsSpy).toHaveBeenCalledWith({ err: errorResponse });
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
    expect(toastErrorsSpy).not.toHaveBeenCalled();
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
    expect(toastErrorsSpy).toHaveBeenCalledWith({ err: errorResponse });
    expect(alert).not.toHaveBeenCalled();
  });
});
