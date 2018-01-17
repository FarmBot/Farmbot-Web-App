import * as React from "react";
import { SyncButton } from "../sync_button";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeUser } from "../../__test_support__/fake_state/resources";
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

  it("is gray when inconsistent", () => {
    const onlineNotConsistent = defensiveClone(FAKE_BOT_STATE);
    onlineNotConsistent.connectivity["bot.mqtt"] = { state: "up", at: "?" };
    const result = shallow(<SyncButton user={fakeUser()}
      dispatch={jest.fn()}
      bot={onlineNotConsistent}
      consistent={false}
      autoSyncEnabled={true} />);
    expect(result.hasClass("gray")).toBeTruthy();
  });

  it("defaults to `disconnected` and `red` when uncertain", () => {
    const badState = defensiveClone(FAKE_BOT_STATE);
    badState.hardware.informational_settings.sync_status = "mistake" as any;
    const result = shallow(<SyncButton user={fakeUser()}
      dispatch={jest.fn()}
      bot={badState}
      consistent={true}
      autoSyncEnabled={true} />);
    expect(result.text()).toContain("DISCONNECTED");
    expect(result.hasClass("red")).toBeTruthy();
  });

  it("syncs when clicked", () => {
    const dispatch = jest.fn();
    const result = shallow(<SyncButton user={fakeUser()}
      dispatch={dispatch}
      bot={FAKE_BOT_STATE}
      consistent={true}
      autoSyncEnabled={true} />);
    result.find("button").simulate("click");
    expect(dispatch).toHaveBeenCalled();
  });
});
