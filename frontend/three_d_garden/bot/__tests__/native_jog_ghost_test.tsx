import React from "react";
import { render, screen } from "@testing-library/react";
import * as toolComponents from "../components/tools";
import { NativeJogGhost } from "../native_jog_ghost";

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
});
