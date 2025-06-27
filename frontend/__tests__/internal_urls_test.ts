import {
  FilePath, Icon, landingPagePath, PAGE_SLUGS, Path,
} from "../internal_urls";

describe("Path()", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });

  it("returns path", () => {
    expect(Path.plants()).toEqual("/app/designer/plants");
    expect(Path.plants(1)).toEqual("/app/designer/plants/1");
    location.pathname = Path.mock(Path.designerSequences("sequence"));
    expect(Path.sequences("sequence")).toEqual("/app/designer/sequences/sequence");
    location.pathname = Path.mock(Path.sequencePage("sequence"));
    expect(Path.sequences("sequence")).toEqual("/app/sequences/sequence");
  });

  it("returns path start result", () => {
    location.pathname = Path.mock(Path.plants(1));
    expect(Path.startsWith(Path.plants())).toEqual(true);
    location.pathname = Path.mock(Path.weeds(1));
    expect(Path.startsWith(Path.plants())).toEqual(false);
  });

  it("modifies path", () => {
    expect(Path.mock(Path.plants())).toEqual("/app/designer/plants");
  });

  it("returns last chunk", () => {
    location.pathname = Path.mock(Path.plants(3));
    expect(Path.getLastChunk()).toEqual("3");
  });

  it("returns index", () => {
    expect(Path.idIndex(Path.app())).toEqual(2);
    expect(Path.idIndex(Path.designer())).toEqual(3);
    expect(Path.idIndex(Path.plants())).toEqual(4);
    expect(Path.idIndex(Path.groups())).toEqual(4);
    expect(Path.idIndex(Path.cropSearch())).toEqual(5);
    expect(Path.idIndex(Path.cropSearch("mint"))).toEqual(6);
    expect(Path.idIndex(Path.plantTemplates(1))).toEqual(6);
  });

  it("returns slug", () => {
    location.pathname = Path.mock(Path.cropSearch("green_mint"));
    expect(Path.getCropSlug()).toEqual("green-mint");
  });

  it("returns path with query", () => {
    expect(Path.settings("os")).toEqual("/app/designer/settings?highlight=os");
    expect(Path.help("os")).toEqual("/app/designer/help?page=os");
    expect(Path.developer("os")).toEqual("/app/designer/developer?page=os");
  });

  it("returns location path", () => {
    expect(Path.location()).toEqual("/app/designer/location");
    expect(Path.location({})).toEqual("/app/designer/location");
    expect(Path.location({ x: 0 })).toEqual("/app/designer/location");
    expect(Path.location({ x: 0, y: 0 }))
      .toEqual("/app/designer/location?x=0&y=0");
    expect(Path.location({ x: 0, y: 0, z: 0 }))
      .toEqual("/app/designer/location?x=0&y=0&z=0");
  });
});

describe("File()", () => {
  it("returns file path", () => {
    expect(FilePath.language("en")).toEqual("/app-resources/languages/en.json");
    expect(FilePath.icon(Icon.map)).toEqual("/app-resources/img/icons/map.svg");
    expect(FilePath.DEFAULT_WEED_ICON)
      .toEqual("/app-resources/img/generic-weed.svg");
  });
});

describe("PAGE_SLUGS()", () => {
  it("returns slug", () => {
    expect(PAGE_SLUGS().map).toEqual("Map");
  });
});

describe("landingPagePath()", () => {
  it("returns correct path", () => {
    expect(landingPagePath("map")).toEqual(Path.designer());
    expect(landingPagePath("logs")).toEqual(Path.logs());
    expect(landingPagePath("messages")).toEqual(Path.messages());
  });
});
