import React from "react";
import TestRenderer from "react-test-renderer";
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
    const wrapper = TestRenderer.create(<DeleteButton {...p} />);
    await wrapper.root.findByType("button").props.onClick?.({
      preventDefault: jest.fn(),
    } as unknown as React.MouseEvent<HTMLButtonElement>);
    expect(p.dispatch).toHaveBeenCalledWith(destroyThunk);
    wrapper.unmount();
    destroySpy.mockRestore();
  });
});
