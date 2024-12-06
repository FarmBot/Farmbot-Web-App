jest.mock("../../../api/crud", () => ({
  initSave: jest.fn(),
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

let mockDev = false;
jest.mock("../../../settings/dev/dev_support", () => ({
  DevSettings: {
    showInternalEnvsEnabled: () => mockDev,
  }
}));

import React, { act } from "react";
import { mount, ReactWrapper } from "enzyme";
import { EnvEditor } from "../env_editor";
import { EnvEditorProps } from "../interfaces";
import { destroy, edit, initSave, save } from "../../../api/crud";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";
import { error } from "../../../toast/toast";
import { clickButton } from "../../../__test_support__/helpers";

describe("<EnvEditor />", () => {
  const fakeProps = (): EnvEditorProps => ({
    dispatch: jest.fn(),
    farmwareEnvs: [],
  });

  const inputChange = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper: ReactWrapper<any>,
    position: number,
    value: string,
    event: "onChange" | "onBlur" = "onChange",
  ) =>
    act(() => wrapper.find("input").at(position).props()[event]?.(
      { currentTarget: { value } } as unknown as React.FocusEvent));

  it("doesn't show warning", () => {
    const wrapper = mount(<EnvEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).not.toContain("warning");
  });

  it("shows warning", () => {
    mockDev = true;
    const wrapper = mount(<EnvEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("warning");
  });

  it("saves new env", () => {
    const wrapper = mount(<EnvEditor {...fakeProps()} />);
    inputChange(wrapper, 0, "key");
    inputChange(wrapper, 1, "value");
    clickButton(wrapper, 0, "", { icon: "fa-plus" });
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv",
      { key: "key", value: "value" });
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't save blank key", () => {
    const wrapper = mount(<EnvEditor {...fakeProps()} />);
    clickButton(wrapper, 0, "", { icon: "fa-plus" });
    expect(initSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Key cannot be blank.");
  });

  it("doesn't save duplicate key", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "key";
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    inputChange(wrapper, 0, "key");
    clickButton(wrapper, 0, "", { icon: "fa-plus" });
    expect(initSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Key has already been taken.");
  });

  it("edits key", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    inputChange(wrapper, 2, "key");
    wrapper.find("input").at(2).simulate("blur");
    expect(edit).toHaveBeenCalledWith(farmwareEnv, { key: "key" });
    expect(save).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("edits value", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    inputChange(wrapper, 3, "value");
    wrapper.find("input").at(3).simulate("blur");
    expect(edit).toHaveBeenCalledWith(farmwareEnv, { value: "value" });
    expect(save).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("deletes env", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    clickButton(wrapper, 1, "", { icon: "fa-times" });
    expect(destroy).toHaveBeenCalledWith(farmwareEnv.uuid);
  });

  it("deletes internal env", () => {
    mockDev = true;
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "camera";
    p.farmwareEnvs = [farmwareEnv];
    const wrapper = mount(<EnvEditor {...p} />);
    clickButton(wrapper, 2, "", { icon: "fa-times" });
    expect(destroy).toHaveBeenCalledWith(farmwareEnv.uuid);
  });
});
