import * as React from "react";
import * as _ from "lodash";
import { history } from "../history";

export function MobileSequencesNav(props: {}) {
  // TODO: This is definitely not right, figure out query objects
  let name = history.getCurrentLocation().pathname.split("/")[3];
  return <div className="mobile-only sequences-mobile-nav col-md-3 col-sm-12">
    <div className="widget-wrapper">
      <div className="widget-header">
        <a href="javascript:history.back()" className="back-arrow">
          <i className="fa fa-arrow-left"></i>&nbsp;&nbsp;
          {_.capitalize(name) || "Name not found"}
        </a>
      </div>
    </div>
  </div>;
}
