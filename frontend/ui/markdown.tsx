import React from "react";
const emoji = require("markdown-it-emoji");
const md = require("markdown-it")({
  breaks: true,
  linkify: true,
  typographer: true,
});

const md_with_html = require("markdown-it")({
  /** Enable HTML tags in source */
  html: true,
  /** Convert '\n' in paragraphs into <br> */
  breaks: true,
  /** Autoconvert URL-like text to links */
  linkify: true,
  /** Enable some language-neutral replacement + quotes beautification */
  typographer: true,
});

md.use(emoji);
md_with_html.use(emoji);

const defaultRenderer = md.renderer.rules.link_open ||
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((tokens: any, index: any, options: any, _env: any, self: any) =>
    self.renderToken(tokens, index, options));

md.renderer.rules.link_open =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (tokens: any, index: any, options: any, env: any, self: any) => {
    const attributeIndex = tokens[index].attrIndex("target");
    if (attributeIndex < 0) {
      tokens[index].attrPush(["target", "_blank"]);
    } else {
      tokens[index].attrs[attributeIndex][1] = "_blank";
    }
    return defaultRenderer(tokens, index, options, env, self);
  };

export const md_for_tests = md;

interface MarkdownProps {
  children?: React.ReactNode;
  html?: boolean;
  className?: string;
}

export function Markdown(props: MarkdownProps) {
  const result = props.html
    ? md_with_html.render(props.children)
    : md.render(props.children);
  return <span
    className={["markdown", props.className].join(" ")}
    dangerouslySetInnerHTML={{ __html: result }}>
  </span>;
}
