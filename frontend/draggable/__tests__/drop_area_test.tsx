import * as React from "react";
import { shallow } from "enzyme";
import { DropArea } from "../drop_area";
import { DropAreaProps } from "../interfaces";

describe("<DropArea />", () => {
  const props = (): DropAreaProps => {
    return {
      callback: jest.fn(),
      isLocked: false
    };
  };

  it("opens", () => {
    const wrapper = shallow<DropArea>(<DropArea {...props()} />);
    wrapper.setState({ isHovered: true });
    expect(wrapper.hasClass("drag-drop-area")).toBeTruthy();
  });

  it("is locked open", () => {
    const p = props();
    p.isLocked = true;
    const wrapper = shallow<DropArea>(<DropArea {...p} />);
    expect(wrapper.hasClass("drag-drop-area")).toBeTruthy();
  });

  it("renders children", () => {
    const wrapper = shallow<DropArea>(<DropArea {...props()}>children</DropArea>);
    expect(wrapper.text()).toEqual("children");
  });

  it("handles drag enter", () => {
    const preventDefault = jest.fn();
    const wrapper = shallow<DropArea>(<DropArea {...props()} />);
    expect(wrapper.instance().state.isHovered).toEqual(false);
    wrapper.simulate("dragEnter", { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(wrapper.instance().state.isHovered).toEqual(true);
  });

  it("handles drag leave", () => {
    const wrapper = shallow<DropArea>(<DropArea {...props()} />);
    wrapper.setState({ isHovered: true });
    wrapper.simulate("dragLeave");
    expect(wrapper.instance().state.isHovered).toEqual(false);
  });

  it("handles drag over", () => {
    const preventDefault = jest.fn();
    const wrapper = shallow<DropArea>(<DropArea {...props()} />);
    expect(wrapper.instance().state.isHovered).toEqual(false);
    wrapper.simulate("dragOver", { preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(wrapper.instance().state.isHovered).toEqual(false);
  });

  it("handles drop", () => {
    const preventDefault = jest.fn();
    const p = props();
    const wrapper = shallow<DropArea>(<DropArea {...p} />);
    expect(wrapper.instance().state.isHovered).toEqual(false);
    wrapper.simulate("drop", {
      preventDefault, dataTransfer: {
        getData: () => "key"
      }
    });
    expect(p.callback).toHaveBeenCalledWith("key");
    expect(preventDefault).toHaveBeenCalled();
    expect(wrapper.instance().state.isHovered).toEqual(true);
  });
});
