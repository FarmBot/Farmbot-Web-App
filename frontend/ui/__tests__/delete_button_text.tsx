import * as React from "react";
import { shallow } from "enzyme";
import { DeleteButton } from "../delete_button";

describe("<DeleteButton />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(() => Promise.resolve()),
    uuid: "resource uuid",
  });

  it("deletes resource", () => {
    const p = fakeProps();
    const wrapper = shallow(<DeleteButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
