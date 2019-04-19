jest.mock("react-redux", () => ({ connect: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { Messages } from "../index";
import { MessagesProps } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<Messages />", () => {
  const fakeProps = (): MessagesProps => ({
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: Function,
    findApiAlertById: jest.fn(),
  });

  it("renders page", () => {
    const wrapper = mount(<Messages {...fakeProps()} />);
    expect(wrapper.text()).toContain("Message Center");
    expect(wrapper.text()).toContain("No messages");
  });

  it("renders content", () => {
    const p = fakeProps();
    p.alerts = [{
      created_at: 123,
      problem_tag: "author.noun.verb",
      priority: 100,
      slug: "slug",
    }];
    const wrapper = mount(<Messages {...p} />);
    expect(wrapper.text()).toContain("Message Center");
    expect(wrapper.text()).toContain("No more messages");
  });
});
