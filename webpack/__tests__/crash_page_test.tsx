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
    expect(html).toContain(fakeError.message);
    expect(html).toContain(fakeError.stack[0]);
    expect(html).toContain(fakeError.stack[1]);
    expect(html).toContain(fakeError.stack[2]);
    jest.resetAllMocks();
    el.find("a").first().simulate("click");
    expect(Session.clear).toHaveBeenCalled();
  });
});
