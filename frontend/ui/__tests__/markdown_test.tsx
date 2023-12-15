/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Token } from "markdown-it";
import { Markdown, md_for_tests } from "../markdown";
import { mount } from "enzyme";

describe("<Markdown />", () => {
  it("renders text", () => {
    const result = mount(Markdown({ children: "nice" }));
    expect(result.html()).toContain("nice");
  });

  it("renders html", () => {
    const result = mount(Markdown({ children: "nice", html: true }));
    expect(result.html()).toContain("nice");
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
