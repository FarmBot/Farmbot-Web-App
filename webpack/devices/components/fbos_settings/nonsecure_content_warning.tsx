import * as React from "react";
import { API } from "../../../api";

export interface NonsecureContentProps {
  children?: React.ReactChild;
  urls: string[];
}

export const allAreHttps = (urls: string[]) => !urls
  .map(x => API.parseURL(x).protocol === "https:")
  .includes(false);

export function NonsecureContentWarning(props: NonsecureContentProps) {
  const { urls, children } = props;
  return <div>{allAreHttps(urls) ? "" : children}</div>;
}
