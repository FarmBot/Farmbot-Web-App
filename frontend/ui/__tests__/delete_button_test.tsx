import React from "react";
import { shallow } from "enzyme";
import { DeleteButton } from "../delete_button";
import * as crud from "../../api/crud";

describe("<DeleteButton />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn((_) => Promise.resolve()),
    uuid: "resource uuid",
  });

  it("deletes resource", async () => {
    const p = fakeProps();
    const destroyThunk = jest.fn();
    const destroySpy = jest.spyOn(crud, "destroy")
      .mockImplementation(() => destroyThunk as never);
    const wrapper = shallow(<DeleteButton {...p} />);
    await wrapper.find("button").props().onClick?.({
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent<HTMLButtonElement>);
    expect(p.dispatch).toHaveBeenCalledWith(destroyThunk);
    destroySpy.mockRestore();
  });
});
