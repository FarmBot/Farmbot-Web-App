import React from "react";
import { ErrorBoundary } from "../error_boundary";

interface PageProps {
  children?: React.ReactNode;
  className?: string;
}

export function Page(props: PageProps) {
  let finalClassName = "all-content-wrapper";
  if (props.className) { finalClassName += ` ${props.className}`; }
  return <div className={finalClassName}>
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
}
