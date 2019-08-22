import React from "react";
import { LuaPart } from "../lua_part";
import { shallow } from "enzyme";
import { fakeAssertProps } from "./test_support";
import { ReduxAction } from "../../../../redux/interfaces";
import { EditResourceParams } from "../../../../api/interfaces";
import { Actions } from "../../../../constants";
import { TaggedSequence } from "farmbot";

describe("<LuaPart/>", () => {
  it("renders default verbiage and props", () => {
    const p =
      fakeAssertProps({ confirmStepDeletion: true });
    expect(p.confirmStepDeletion).toBe(true);
    const el = shallow(<LuaPart {...p} />);
    const fakeEvent =
      ({ currentTarget: { value: "hello" } });
    el.find("textarea").first().simulate("blur", fakeEvent);
    expect(p.dispatch).toHaveBeenCalled();
    const calledWith: ReduxAction<EditResourceParams> | undefined =
      (p.dispatch as jest.Mock).mock.calls[0][0];
    if (calledWith) {
      expect(calledWith.type).toEqual(Actions.OVERWRITE_RESOURCE);
      expect(calledWith.payload.uuid).toEqual(p.currentSequence.uuid);
      const s = calledWith.payload.update as TaggedSequence;
      expect(s).toBeTruthy();
      const item = ((s.body && s.body.body) || [])[1]
      console.log(item);
      debugger;
    } else {
      fail();
    }
  });
});
