import React from "react";
import type Renderer from "markdown-it/lib/renderer.mjs";
import type Token from "markdown-it/lib/token.mjs";
import { render } from "@testing-library/react";
import { Markdown, md_for_tests } from "../markdown";

describe("<Markdown />", () => {
  it("renders text", () => {
    const { container } = render(<Markdown>nice</Markdown>);
    expect(container.innerHTML).toContain("nice");
  });

  it("renders html", () => {
    const { container } = render(<Markdown html={true}>nice</Markdown>);
    expect(container.innerHTML).toContain("nice");
  });
});

describe("link_open_for_tests()", () => {
  const fakeTokens = () => [
    { attrPush: jest.fn(), attrIndex: () => 0, attrs: [["", ""]] },
  ] as unknown as Token[];

  const fakeRenderer = () => {
    const renderToken = jest.fn(() => "");
    const self = { renderToken } as unknown as Renderer;
    return { renderToken, self };
  };

  it("adds new attribute", () => {
    const tokens = fakeTokens();
    tokens[0].attrIndex = () => -1;
    const { renderToken, self } = fakeRenderer();
    md_for_tests.renderer.rules.link_open?.(tokens, 0, {}, {},
      self);
    expect(tokens[0].attrPush).toHaveBeenCalledWith(["target", "_blank"]);
    expect(renderToken).toHaveBeenCalledWith(tokens, 0, {});
  });

  it("updates attribute", () => {
    const tokens = fakeTokens();
    const { renderToken, self } = fakeRenderer();
    md_for_tests.renderer.rules.link_open?.(tokens, 0, {}, {},
      self);
    expect(tokens[0].attrs?.[0][1]).toEqual("_blank");
    expect(renderToken).toHaveBeenCalledWith(tokens, 0, {});
  });
});
