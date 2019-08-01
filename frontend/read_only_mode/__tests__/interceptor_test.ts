let mockReadonlyState = true;

jest.mock("../app_is_read_only", () => ({
  appIsReadonly: jest.fn(() => mockReadonlyState)
}));

import { DeepPartial } from "redux";
import { AxiosRequestConfig } from "axios";
import { readOnlyInterceptor } from "..";
import { warning } from "../../toast/toast";

describe("readOnlyInterceptor", () => {
  it("resolves the config when app is not read-only", async () => {
    const conf: DeepPartial<AxiosRequestConfig> = {};
    const result = await readOnlyInterceptor(conf as AxiosRequestConfig);
    expect(result).toBe(conf);
  });

  it("rejects non-GET HTTP requests when app is read-only", (done) => {
    mockReadonlyState = true;
    const conf: DeepPartial<AxiosRequestConfig> = { method: "PUT" };
    readOnlyInterceptor(conf as AxiosRequestConfig)
      .then(fail, (result) => {
        expect(result).toBe(conf);
        expect(warning)
          .toHaveBeenCalledWith("Refusing to modify data in read-only mode");
        done();
      });
  });

  it("allows HTTP GET requests when app is read-only", (done) => {
    mockReadonlyState = true;
    const conf: DeepPartial<AxiosRequestConfig> = {
      method: "GET"
    };
    readOnlyInterceptor(conf as AxiosRequestConfig)
      .then((result) => {
        expect(result).toBe(conf);
        done();
      }, fail);
  });
});
