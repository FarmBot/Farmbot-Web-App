import {
  devDocLink, devDocLinkClick, docLink, docLinkClick, genesisDocLink,
} from "../doc_link";
import { ExternalUrl } from "../../external_urls";
import { Path } from "../../internal_urls";

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

describe("genesisDocLink", () => {
  it("creates doc links", () => {
    expect(genesisDocLink()).toEqual(ExternalUrl.genesisDocs + "/");
    expect(genesisDocLink("why-is-my-farmbot-not-moving"))
      .toEqual(ExternalUrl.genesisDocs + "/why-is-my-farmbot-not-moving");
  });
});

describe("docLinkClick", () => {
  it("navigates to doc link", () => {
    location.pathname = Path.mock(Path.designer());
    const navigate = jest.fn();
    docLinkClick("farmware", navigate)();
    expect(navigate).toHaveBeenCalledWith(Path.help("farmware"));
    expect(location.assign).not.toHaveBeenCalled();
  });

  it("reloads to doc link", () => {
    location.pathname = Path.mock(Path.help());
    location.assign = jest.fn();
    const navigate = jest.fn();
    docLinkClick("farmware", navigate)();
    expect(navigate).not.toHaveBeenCalled();
    expect(location.assign).toHaveBeenCalledWith(expect.stringContaining(
      Path.help("farmware")));
  });
});

describe("devDocLinkClick", () => {
  it("navigates to doc link", () => {
    location.pathname = Path.mock(Path.designer());
    const navigate = jest.fn();
    devDocLinkClick("lua", navigate)();
    expect(navigate).toHaveBeenCalledWith(Path.developer("lua"));
    expect(location.assign).not.toHaveBeenCalled();
  });
});
