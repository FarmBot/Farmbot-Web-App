import React from "react";
import { LuaPart } from "../lua_part";
import { shallow } from "enzyme";
import { ReduxAction } from "../../../../redux/interfaces";
import { EditResourceParams } from "../../../../api/interfaces";
import { Actions } from "../../../../constants";
import { TaggedSequence } from "farmbot";
import { fakeAssertProps } from "../../__tests__/tile_assertion_test";

describe("<LuaPart/>", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const el = shallow(<LuaPart {...p} />);
    const fakeEvent =
      ({ currentTarget: { value: "hello" } });
    el.find("textarea").first().simulate("change", fakeEvent);
    expect(p.dispatch).toHaveBeenCalled();
    const calledWith: ReduxAction<EditResourceParams> | undefined =
      (p.dispatch as jest.Mock).mock.calls[0][0];
    if (calledWith) {
      expect(calledWith.type).toEqual(Actions.OVERWRITE_RESOURCE);
      expect(calledWith.payload.uuid).toEqual(p.currentSequence.uuid);
      const s = calledWith.payload.update as TaggedSequence["body"];
      expect(s).toBeTruthy();
      const item = (s.body || [])[1];
      if (item.kind === "assertion") {
        expect(item.args.lua).toEqual("hello");
      } else {
        fail();
      }
    } else {
      fail();
    }
  });
});
