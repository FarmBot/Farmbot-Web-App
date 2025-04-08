import {
  devDocLink,
  devDocLinkClick,
  DevDocLinkClickProps,
  docLink,
  docLinkClick,
  DocLinkClickProps,
  genesisDocLink,
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
  const fakeProps = (): DocLinkClickProps => ({
    slug: "farmware",
    navigate: jest.fn(),
    dispatch: jest.fn(),
  });

  it("navigates to doc link", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    docLinkClick(p)();
    expect(p.navigate).toHaveBeenCalledWith(Path.help("farmware"));
    expect(location.assign).not.toHaveBeenCalled();
  });
});

describe("devDocLinkClick", () => {
  const fakeProps = (): DevDocLinkClickProps => ({
    slug: "lua",
    navigate: jest.fn(),
    dispatch: jest.fn(),
  });

  it("navigates to doc link", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    devDocLinkClick(p)();
    expect(p.navigate).toHaveBeenCalledWith(Path.developer("lua"));
    expect(location.assign).not.toHaveBeenCalled();
  });
});
