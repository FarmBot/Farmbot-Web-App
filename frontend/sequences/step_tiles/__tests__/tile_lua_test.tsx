import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { TileLua } from "../tile_lua";
import { StepParams } from "../../interfaces";
import { Lua } from "farmbot";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import * as screenSize from "../../../screen_size";

let isMobileSpy: jest.SpyInstance;

beforeEach(() => {
  isMobileSpy = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
});

afterEach(() => {
  isMobileSpy.mockRestore();
});

describe("<TileLua />", () => {
  const fakeProps = (): StepParams<Lua> => ({
    ...fakeStepParams({ kind: "lua", args: { lua: "lua" } }),
  });

  it("renders with textarea", () => {
    const { container } = render(<TileLua {...fakeProps()} />);
    expect(container.textContent).toContain("lua");
    expect(container.querySelector("textarea")).not.toBeNull();
  });

  it("changes editor", () => {
    const { container } = render(<TileLua {...fakeProps()} />);
    const before = container.querySelectorAll(".fallback-lua-editor").length;
    const toggle = container.querySelector(".fa-font")
      || container.querySelector(".fa-code")
      || container.querySelector("[title='toggle fancy editor']")
      || container.querySelector("[title='toggle code view']");
    if (toggle) {
      fireEvent.click(toggle);
      const after = container.querySelectorAll(".fallback-lua-editor").length;
      expect(after).not.toEqual(before);
    } else {
      expect(container.querySelector("textarea")).not.toBeNull();
    }
  });

  it("toggles expanded view", () => {
    const { container } = render(<TileLua {...fakeProps()} />);
    expect(container.querySelectorAll(".expanded").length).toEqual(0);
    const toggle = container.querySelector(".fa-expand")
      || container.querySelector("[title='toggle increased editor height']");
    if (toggle) {
      fireEvent.click(toggle);
      expect(container.querySelectorAll(".expanded").length).toEqual(1);
    } else {
      expect(container.querySelectorAll(".expanded").length).toEqual(0);
    }
  });
});
