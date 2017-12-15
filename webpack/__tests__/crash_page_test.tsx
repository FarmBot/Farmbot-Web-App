jest.mock("../session", () => {
  return {
    Session: {
      clear: jest.fn()
    }
  };
});

import * as React from "react";
import { crashPage } from "../crash_page";
import { mount } from "enzyme";
import { Session } from "../session";

describe("<CrashPage/>", () => {
  it("renders error info", () => {
    const fakeError = {
      stack: [
        "@@@A",
        "@@@B",
        "@@@C",
      ],
      message: "@@@ERROR@@@"
    };
    const CrashPage = crashPage(fakeError);
    const el = mount(<CrashPage />);
    const html = el.html();
    expect(html).toContain(html);
    expect(html).toContain("@@@A");
    expect(html).toContain("@@@B");
    expect(html).toContain("@@@C");
    jest.resetAllMocks();
    el.find("a").first().simulate("click");
    expect(Session.clear).toHaveBeenCalled();
  });
});
