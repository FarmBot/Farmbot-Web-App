import * as stopIe from "../../util/stop_ie";
import * as i18n from "../../i18n";
import * as routes from "../../routes";
import * as i18next from "i18next";

let stopIESpy: jest.SpyInstance;
let detectLanguageSpy: jest.SpyInstance;
let attachAppToDomSpy: jest.SpyInstance;
let initSpy: jest.SpyInstance;

beforeEach(() => {
  stopIESpy = jest.spyOn(stopIe, "stopIE").mockImplementation(jest.fn());
  detectLanguageSpy = jest.spyOn(i18n, "detectLanguage")
    .mockImplementation(() => Promise.resolve({}));
  attachAppToDomSpy = jest.spyOn(routes, "attachAppToDom")
    .mockImplementation(jest.fn());
  initSpy = jest.spyOn(i18next, "init")
    .mockImplementation(((_, cb) => {
      cb?.();
      return undefined as never;
    }) as typeof i18next.init);
});

afterEach(() => {
  stopIESpy.mockRestore();
  detectLanguageSpy.mockRestore();
  attachAppToDomSpy.mockRestore();
  initSpy.mockRestore();
});

describe("main app entry file", () => {
  it("Calls the expected callbacks", async () => {
    await import("..");

    expect(stopIe.stopIE).toHaveBeenCalled();
    expect(i18n.detectLanguage).toHaveBeenCalled();
    expect(i18next.init).toHaveBeenCalled();
  });
});
