const mock = {
  response: {
    data: (undefined as undefined | {}) // Mutable
  }
};

jest.mock("axios",
  () => ({ default: { post: jest.fn(() => Promise.resolve(mock.response)) } }));

import { API } from "../../api";
import { Content } from "../../constants";
import { requestAccountExport, generateFilename } from "../request_account_export";
import { success } from "farmbot-toastr";
import axios from "axios";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

API.setBaseUrl("http://www.foo.bar");

describe("generateFilename", () => {
  it("generates a filename", () => {
    const device = fakeDevice().body;
    device.name = "FOO";
    device.id = 123;
    const result = generateFilename({ device });
    expect(result).toEqual("export_foo_123.json");
  });
});
describe("requestAccountExport", () => {
  it("pops toast on completion (when API has email support)", async () => {
    await requestAccountExport();
    expect(axios.post).toHaveBeenCalledWith(API.current.exportDataPath);
    expect(success).toHaveBeenCalledWith(Content.EXPORT_SENT);
  });

  it("downloads the data synchronously (when API has no email support)", async () => {
    mock.response.data = {};
    window.URL = window.URL || ({} as typeof window.URL);
    window.URL.createObjectURL = jest.fn();
    window.URL.revokeObjectURL = jest.fn();
    const a = await requestAccountExport();
    if (a) {
      expect(a).toBeInstanceOf(HTMLElement);
      expect(a.tagName).toBe("A");
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
      mock.response.data = undefined;
    } else {
      fail();
    }
  });
});
