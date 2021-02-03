let mockPath = "";
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

import { devDocLink, devDocLinkClick, docLink, docLinkClick } from "../doc_link";
import { ExternalUrl } from "../../external_urls";
import { push } from "../../history";

describe("docLink", () => {
  it("creates doc links", () => {
    expect(docLink()).toEqual(ExternalUrl.softwareDocs + "/");
    expect(docLink("farmware")).toEqual(ExternalUrl.softwareDocs + "/farmware");
  });
});

describe("devDocLink", () => {
  it("creates doc links", () => {
    expect(devDocLink()).toEqual(ExternalUrl.developerDocs + "/");
    expect(devDocLink("lua")).toEqual(ExternalUrl.developerDocs + "/lua");
  });
});

describe("docLinkClick", () => {
  it("navigates to doc link", () => {
    mockPath = "/app/designer";
    docLinkClick("farmware")();
    expect(push).toHaveBeenCalledWith("/app/designer/help?page=farmware");
    expect(location.assign).not.toHaveBeenCalled();
  });

  it("reloads to doc link", () => {
    mockPath = "/app/designer/help";
    location.assign = jest.fn();
    docLinkClick("farmware")();
    expect(push).not.toHaveBeenCalled();
    expect(location.assign).toHaveBeenCalledWith(expect.stringContaining(
      "/app/designer/help?page=farmware"));
  });
});

describe("devDocLinkClick", () => {
  it("navigates to doc link", () => {
    mockPath = "/app/designer";
    devDocLinkClick("lua")();
    expect(push).toHaveBeenCalledWith("/app/designer/developer?page=lua");
    expect(location.assign).not.toHaveBeenCalled();
  });
});
