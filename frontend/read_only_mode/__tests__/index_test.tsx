import React from "react";
import { render } from "@testing-library/react";
import { InternalAxiosRequestConfig } from "axios";
import { ReadOnlyIcon, readOnlyInterceptor } from "../index";
import { warning } from "../../toast/toast";
import * as readonlyMode from "../app_is_read_only";

describe("readOnlyInterceptor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("resolves the config when app is not read-only", async () => {
    jest.spyOn(readonlyMode, "appIsReadonly")
      .mockImplementation(() => false);
    const conf = {} as InternalAxiosRequestConfig;
    await expect(readOnlyInterceptor(conf)).resolves.toEqual(conf);
    expect(warning).not.toHaveBeenCalled();
  });

  it("rejects non-GET HTTP requests when app is read-only", async () => {
    jest.spyOn(readonlyMode, "appIsReadonly")
      .mockImplementation(() => true);
    const conf = { method: "PUT" } as InternalAxiosRequestConfig;
    await expect(readOnlyInterceptor(conf)).rejects.toEqual(conf);
    expect(warning)
      .toHaveBeenCalledWith("Refusing to modify data in read-only mode");
  });

  it("allows HTTP GET requests when app is read-only", async () => {
    jest.spyOn(readonlyMode, "appIsReadonly")
      .mockImplementation(() => true);
    const conf = { method: "GET" } as InternalAxiosRequestConfig;
    await expect(readOnlyInterceptor(conf)).resolves.toEqual(conf);
    expect(warning).not.toHaveBeenCalled();
  });
});

describe("<ReadOnlyIcon />", () => {
  it("shows nothing when unlocked", () => {
    const { container } = render(<ReadOnlyIcon locked={false} />);
    expect(container.querySelectorAll(".read-only-icon").length).toEqual(0);
  });

  it("shows the pencil icon when locked", () => {
    const { container } = render(<ReadOnlyIcon locked={true} />);
    expect(container.querySelectorAll(".fa-pencil").length).toBe(1);
    expect(container.querySelectorAll(".fa-ban").length).toBe(1);
  });
});
