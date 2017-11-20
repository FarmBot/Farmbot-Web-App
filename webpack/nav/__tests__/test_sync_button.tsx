import * as React from "react";
import { SyncButton } from "../sync_button";
import { bot } from "../../__test_support__/fake_state/bot";
import { defensiveClone } from "../../util";
import { shallow } from "enzyme";

const FAKE_BOT_STATE = defensiveClone(bot);

describe("<SyncButton/>", function () {
  it("renders nothing when not given a bot", function () {
    const dispatcher = jest.fn();
    const result = shallow(<SyncButton user={undefined}
      dispatch={dispatcher}
      bot={FAKE_BOT_STATE}
      consistent={true}
      autoSyncEnabled={true} />);
    expect(result.hasClass("nav-sync")).toBeFalsy();
    expect(result.html()).toEqual("<span></span>");
  });
});
