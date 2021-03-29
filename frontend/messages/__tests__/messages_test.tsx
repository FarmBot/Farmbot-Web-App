import React from "react";
import { RawMessagesPanel as MessagesPanel } from "../messages";
import { mount } from "enzyme";
import { MessagesProps } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<MessagesPanel />", () => {
  const fakeProps = (): MessagesProps => ({
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
    findApiAlertById: jest.fn(),
  });

  it("renders page", () => {
    const wrapper = mount(<MessagesPanel {...fakeProps()} />);
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
    const wrapper = mount(<MessagesPanel {...p} />);
    expect(wrapper.text()).toContain("No more messages");
  });
});
