import { updatePageInfo, attachToRoot } from "../page";
import React from "react";
import * as i18n from "../../i18n";
import * as i18next from "i18next";
import * as reactDomClient from "react-dom/client";

describe("updatePageInfo()", () => {
  it("sets page title", () => {
    updatePageInfo("page name");
    expect(document.title).toEqual("Page name - FarmBot");
  });

  it("sets page title: Farm Designer", () => {
    updatePageInfo("designer");
    expect(document.title).toEqual("Farm designer - FarmBot");
  });

  it("sets page title: Farm Designer: Plants", () => {
    updatePageInfo("designer", "plants");
    expect(document.title).toEqual("Farm designer: Plants - FarmBot");
  });
});

class Foo extends React.Component<{ text?: string }> {
  render() { return <p>{this.props.text}</p>; }
}

const clear = () => {
  const root = document.getElementById("root") as
    (Element & { remove?: () => void }) | null;
  if (!root) { return; }
  if (typeof root.remove == "function") {
    root.remove();
    return;
  }
  root.parentNode?.removeChild(root);
};

describe("attachToRoot()", () => {
  it("attaches page", () => {
    clear();
    const render = jest.fn();
    jest.spyOn(reactDomClient, "createRoot").mockImplementation(() =>
      ({ render, unmount: jest.fn() }) as unknown as ReturnType<typeof reactDomClient.createRoot>);
    expect(() => attachToRoot(Foo, { text: "Bar" })).not.toThrow();
    expect(reactDomClient.createRoot).toHaveBeenCalledWith(
      document.getElementById("root"));
    expect(render).toHaveBeenCalled();
    clear();
  });
});

describe("entryPoint()", () => {
  it("calls entry callbacks", async () => {
    clear();
    const { entryPoint } = jest.requireActual<typeof import("../page")>("../page");
    const render = jest.fn();
    jest.spyOn(reactDomClient, "createRoot").mockImplementation(() =>
      ({ render, unmount: jest.fn() }) as unknown as ReturnType<typeof reactDomClient.createRoot>);
    jest.spyOn(i18n, "detectLanguage").mockResolvedValue({
      lng: "en",
      fallbackLng: "en",
      resources: {},
      keySeparator: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
    const initSpy = jest.spyOn(i18next, "init")
      .mockImplementation((_conf, cb) => {
        // eslint-disable-next-line no-null/no-null
        cb?.(null as never, (() => "") as never);
        return {} as unknown as ReturnType<typeof i18next.init>;
      });
    const result = entryPoint(Foo) as Promise<unknown> | undefined;
    if (result && typeof result.then == "function") {
      await result;
      expect(initSpy).toHaveBeenCalled();
      expect(render).toHaveBeenCalled();
    }
    clear();
  });
});
