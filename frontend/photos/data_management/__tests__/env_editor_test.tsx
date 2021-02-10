jest.mock("../../../api/crud", () => ({
  initSave: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

import React from "react";
import { act } from "react-dom/test-utils";
import { mount, ReactWrapper } from "enzyme";
import { EnvEditor } from "../env_editor";
import { EnvEditorProps } from "../interfaces";
import { destroy, edit, initSave, save } from "../../../api/crud";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";

describe("<EnvEditor />", () => {
  const fakeProps = (): EnvEditorProps => ({
    dispatch: jest.fn(),
    farmwareEnvs: [],
  });

  const inputChange = (
    wrapper: ReactWrapper,
    position: number,
    value: string,
    event: "onChange" | "onBlur" = "onChange",
  ) =>
    act(() => wrapper.find("input").at(position).props()[event]?.(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { currentTarget: { value } } as any));

  it("saves new env", () => {
    const wrapper = mount(<EnvEditor {...fakeProps()} />);
    inputChange(wrapper, 0, "key");
    inputChange(wrapper, 1, "value");
    wrapper.find("button").at(1).simulate("click");
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv",
      { key: "key", value: "value" });
  });

  it("edits key", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    inputChange(wrapper, 2, "key");
    inputChange(wrapper, 2, "", "onBlur");
    expect(edit).toHaveBeenCalledWith(farmwareEnv, { key: "key" });
    expect(save).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("edits value", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    inputChange(wrapper, 3, "value");
    inputChange(wrapper, 3, "", "onBlur");
    expect(edit).toHaveBeenCalledWith(farmwareEnv, { value: "value" });
    expect(save).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("deletes env", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(destroy).toHaveBeenCalledWith(farmwareEnv.uuid);
  });
});
