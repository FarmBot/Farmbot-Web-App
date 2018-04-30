jest.mock("farmbot-toastr", () => ({ success: jest.fn() }));
jest.mock("axios",
  () => ({ default: { post: jest.fn(() => Promise.resolve()) } }));

import { API } from "../../api";
import { Content } from "../../constants";
import { requestAccountExport } from "../request_account_export";
import { success } from "farmbot-toastr";
import axios from "axios";

describe("requestAccountExport", () => {
  it("pops toast on completion", async () => {
    API.setBaseUrl("http://www.foo.bar");
    await requestAccountExport();
    expect(axios.post).toHaveBeenCalledWith(API.current.exportDataPath);
    expect(success).toHaveBeenCalledWith(Content.EXPORT_SENT);
  });
});
