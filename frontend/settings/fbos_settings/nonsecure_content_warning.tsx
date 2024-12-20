import React from "react";
import { API } from "../../api";

interface NonsecureContentProps {
  /** The warning to show the user if one of the URLs is insecure. */
  children?: React.ReactNode;
  urls: string[];
}

/** Given a list of URLs, returns bool indicating wether or not all URLs in the
 * set are HTTPS:// */
export const allAreHttps = (urls: string[]) => !urls
  .map(x => API.parseURL(x).protocol === "https:")
  .includes(false);

/** Stateless component that renders `props.children` when `props.urls`
 * contains a non-HTTPS URL. */
export function NonsecureContentWarning(props: NonsecureContentProps) {
  const { urls, children } = props;
  return <div>{allAreHttps(urls) ? "" : children}</div>;
}
