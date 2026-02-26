let mockData: {} | undefined = {};

import { API } from "../../../api";
import { Content } from "../../../constants";
import { success } from "../../../toast/toast";
import axios from "axios";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

API.setBaseUrl("http://www.foo.bar");
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();

beforeEach(() => {
  API.setBaseUrl("http://www.foo.bar");
  jest.clearAllMocks();
  axios.post = jest.fn(() => Promise.resolve({ data: mockData } as never)) as never;
});

describe("generateFilename()", () => {
  it("generates a filename", () => {
    const { generateFilename } = jest.requireActual("../request_account_export");
    const device = fakeDevice().body;
    device.name = "FOO";
    device.id = 123;
    const result = generateFilename({ device });
    expect(result).toEqual("export_foo_123.json");
  });
});

describe("requestAccountExport()", () => {
  it("pops toast on completion (when API has email support)", async () => {
    const { requestAccountExport } = jest.requireActual("../request_account_export");
    mockData = undefined;
    await requestAccountExport();
    expect(axios.post).toHaveBeenCalledWith(API.current.exportDataPath);
    expect(success).toHaveBeenCalledWith(Content.EXPORT_SENT);
    expect(window.URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("downloads the data synchronously (when API has no email support)",
    async () => {
      const { requestAccountExport } = jest.requireActual("../request_account_export");
      mockData = {};
      await requestAccountExport();
      expect(axios.post).toHaveBeenCalledWith(API.current.exportDataPath);
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });
});
