import * as React from "react";
import { JSXChildren } from "../util";
let emoji = require("markdown-it-emoji");
let md = require("markdown-it")({
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

interface MarkdownProps {
  children?: JSXChildren;
}

export function Markdown(props: MarkdownProps) {
  let result = md.render(props.children);
  return <span className="markdown"
    dangerouslySetInnerHTML={{ __html: result }}>
  </span>;
}

