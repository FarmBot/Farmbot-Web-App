let mockResponse: string | Error = "12345";
// ...
jest.mock("axios", () => {
  return {
    post: jest.fn(() => {
      if (typeof mockResponse === "string") {
        return Promise.resolve(mockResponse);
      } else {
        return Promise.reject(mockResponse);
      }
    })
  };
});

import * as React from "react";
import { shallow } from "enzyme";
import { DemoIframe, WAITING_ON_API } from "../demo_iframe";
import Axios from "axios";

describe("<DemoIframe/>", () => {
  it("renders OK", (done) => {
    mockResponse = "yep.";
    const el = shallow<DemoIframe>(<DemoIframe />);
    expect(el.text()).toContain("DEMO THE APP");
    el
      .instance()
      .requestAccount()
      .then(() => {
        expect(Axios.post).toHaveBeenCalled();
        el.update();
        expect(el.state().stage).toContain(WAITING_ON_API);
        done();
      });
  });

  it("handles MQTT messages", () => {
    location.assign = jest.fn();
    const el = shallow<DemoIframe>(<DemoIframe />);
    el.instance().handleMessage("foo", Buffer.from("bar"));
    expect(location.assign).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("does something 🤫", () => {
    mockResponse = "OK!";
    const el = shallow<DemoIframe>(<DemoIframe />);
    Math.round = jest.fn(() => 51);
    el.instance().requestAccount();
    expect(Axios.post).toHaveBeenCalled();
    el.render();
    expect(el.text()).toContain("BIRDS AREN'T REAL");
  });

  it("renders errors", (done) => {
    mockResponse = new Error("Nope.");
    const el = shallow<DemoIframe>(<DemoIframe />);
    el
      .instance()
      .requestAccount()
      .then(() => {
        expect(Axios.post).toHaveBeenCalled();
        el.render();
        expect(el.state().error).toBe(mockResponse);
        done();
      });
  });
});
