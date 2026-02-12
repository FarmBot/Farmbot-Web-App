/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Token } from "markdown-it";
import { render } from "@testing-library/react";
import { Markdown, md_for_tests } from "../markdown";

describe("<Markdown />", () => {
  it("renders text", () => {
    const { container } = render(Markdown({ children: "nice" }));
    expect(container.innerHTML).toContain("nice");
  });

  it("renders html", () => {
    const { container } = render(Markdown({ children: "nice", html: true }));
    expect(container.innerHTML).toContain("nice");
  });
});

describe("link_open_for_tests()", () => {
  const fakeTokens = () => [
    { attrPush: jest.fn(), attrIndex: () => 0, attrs: [["", ""]] },
  ] as unknown as Token[];

  it("adds new attribute", () => {
    const tokens = fakeTokens();
    tokens[0].attrIndex = () => -1;
    const renderToken = jest.fn();
    md_for_tests.renderer.rules.link_open?.(tokens, 0, {}, {},
      { renderToken } as any);
    expect(tokens[0].attrPush).toHaveBeenCalledWith(["target", "_blank"]);
    expect(renderToken).toHaveBeenCalledWith(tokens, 0, {});
  });

  it("updates attribute", () => {
    const tokens = fakeTokens();
    const renderToken = jest.fn();
    md_for_tests.renderer.rules.link_open?.(tokens, 0, {}, {},
      { renderToken } as any);
    expect(tokens[0].attrs?.[0][1]).toEqual("_blank");
    expect(renderToken).toHaveBeenCalledWith(tokens, 0, {});
  });
});
