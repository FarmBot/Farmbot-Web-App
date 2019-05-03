import * as React from "react";
import { DangerousDeleteWidget } from "../dangerous_delete_widget";
import { mount, shallow } from "enzyme";
import { DangerousDeleteProps } from "../../interfaces";
import { BlurablePassword } from "../../../ui/blurable_password";

describe("<DangerousDeleteWidget/>", () => {
  const fakeProps = (): DangerousDeleteProps => ({
    title: "Delete something important",
    warning: "This will remove data.",
    confirmation: "Are you sure?",
    dispatch: jest.fn(),
    onClick: jest.fn(),
  });

  it("executes deletion", () => {
    const p = fakeProps();
    const wrapper = mount(<DangerousDeleteWidget {...p} />);
    wrapper.setState({ password: "123" });
    wrapper.find("button.red").last().simulate("click");
    expect(p.onClick).toHaveBeenCalledTimes(1);
    expect(p.onClick).toHaveBeenCalledWith({ password: "123" });
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("enters password", () => {
    const wrapper = shallow<DangerousDeleteWidget>(
      <DangerousDeleteWidget {...fakeProps()} />);
    wrapper.find(BlurablePassword).simulate("commit", {
      currentTarget: { value: "password" }
    });
    expect(wrapper.state().password).toEqual("password");
  });

  it("enters password", () => {
    const wrapper = mount<DangerousDeleteWidget>(
      <DangerousDeleteWidget {...fakeProps()} />);
    wrapper.setState({ password: "password" });
    wrapper.unmount();
    expect(wrapper).toEqual({});
  });
});
