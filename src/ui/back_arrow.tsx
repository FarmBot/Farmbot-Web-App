import * as React from "react";

export function BackArrow() {
  return <a href="javascript:history.back()" className="back-arrow">
    <i className="fa fa-arrow-left"></i>
  </a>;
};
