import React from "react";
import { DeleteButton } from "../delete_button";
import * as crud from "../../api/crud";
import {
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

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
    const wrapper = createRenderer(<DeleteButton {...p} />);
    await wrapper.root.findByType("button").props.onClick?.({
      preventDefault: jest.fn(),
    });
    expect(p.dispatch).toHaveBeenCalledWith(destroyThunk);
    unmountRenderer(wrapper);
    destroySpy.mockRestore();
  });
});
