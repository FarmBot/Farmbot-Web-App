import React from "react";
import { render, screen } from "@testing-library/react";
import * as toolComponents from "../components/tools";
import {
  NativeJogGhost, NativeJogUtmShadow, NATIVE_JOG_UTM_SHADOW_RADIUS,
} from "../native_jog_ghost";
import {
  createRenderer, unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<NativeJogGhost />", () => {
  it("renders the UTM and mounted tool content at half opacity", () => {
    jest.spyOn(toolComponents, "OpacityFilter")
      .mockImplementation(props =>
        <i
          data-testid={"ghost-opacity"}
          data-interactive={String(props.interactive)}
          data-opacity={props.opacity}>
          {props.children}
        </i>);
    const { container } = render(
      <NativeJogGhost name={"bot-jog-x"} position={[100, 0, 0]}>
        <i data-testid={"mounted-tool"} />
      </NativeJogGhost>,
    );

    expect(container.querySelector("[name='bot-jog-x-ghost']"))
      .toHaveAttribute("position", "100,0,0");
    expect(container.querySelector("[name='bot-jog-x-ghost-utm']"))
      .toBeInTheDocument();
    expect(screen.getByTestId("mounted-tool")).toBeInTheDocument();
    expect(screen.getByTestId("ghost-opacity"))
      .toHaveAttribute("data-opacity", "0.5");
    expect(screen.getByTestId("ghost-opacity"))
      .toHaveAttribute("data-interactive", "false");
  });

  it("renders a 70mm translucent white circle at the soil position", () => {
    const wrapper = createRenderer(
      <NativeJogUtmShadow
        name={"native-jog-current-utm"}
        position={[100, 200, 410]} />,
    );

    const shadow = wrapper.root.find(node =>
      `${node.type}` == "mesh" &&
      node.props.name == "native-jog-current-utm-shadow");
    expect(shadow.props.position).toEqual([100, 200, 410]);
    const circle = shadow.find(node => `${node.type}` == "circleGeometry");
    expect(circle.props.args).toEqual(
      [NATIVE_JOG_UTM_SHADOW_RADIUS, 64],
    );
    const material = shadow.find(node =>
      node.type == "div" && node.props.color == "white");
    expect(material.props.opacity).toEqual(0.5);
    expect(material.props.transparent).toEqual(true);
    expect(material.props.depthWrite).toEqual(false);
    expect(NATIVE_JOG_UTM_SHADOW_RADIUS * 2).toEqual(70);
    unmountRenderer(wrapper);
  });
});
