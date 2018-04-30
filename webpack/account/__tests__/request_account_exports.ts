jest.mock("farmbot-toastr", () => {
  return {
    success: jest.fn()
  };
});

jest.mock("axios", () => {
  return {
    default: { post: jest.fn(() => Promise.resolve()) }
  };
});

import { API } from "../../api";
import { Content } from "../../constants";
import { requestAccountExport } from "../request_account_export";
import { success } from "farmbot-toastr";
import { t } from "i18next";
import axios from "axios";

describe("requestAccountExport", () => {
  it("pops toast on completion", () => {
    API.setBaseUrl("http://www.foo.bar");
    requestAccountExport();
    expect(axios.post).toHaveBeenCalledWith(API.current.exportDataPath);
    expect(success).toHaveBeenCalledWith(Content.EXPORT_SENT);
  });
});
