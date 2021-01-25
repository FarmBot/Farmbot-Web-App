jest.mock("../../history", () => ({ push: jest.fn() }));

import { docLink, docLinkClick } from "../doc_link";
import { ExternalUrl } from "../../external_urls";
import { push } from "../../history";

describe("docLink", () => {
  it("creates doc links", () => {
    expect(docLink()).toEqual(ExternalUrl.softwareDocs + "/");
    expect(docLink("farmware")).toEqual(ExternalUrl.softwareDocs + "/farmware");
  });
});

describe("docLinkClick", () => {
  it("navigates to doc link", () => {
    docLinkClick("farmware")();
    expect(push).toHaveBeenCalledWith("/app/designer/help?page=farmware");
  });
});
