import * as React from "react";

interface HelpProps {
  text: string;
}

export function Help(props: HelpProps) {
  return <div className="help">
    <i className="fa fa-question-circle help-icon"></i>
    <div className="help-text">{props.text}</div>
  </div>;
}
