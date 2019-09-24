import * as React from "react";

import { DocSlug, docLink } from ".";
import { t } from "../i18next_wrapper";

export interface ToolTipProps {
  children?: React.ReactNode;
  className?: string;
  helpText: string;
  docPage?: DocSlug;
}

interface State {
  isOpen: boolean;
}

export class ToolTip extends React.Component<ToolTipProps, Partial<State>> {
  state: State = { isOpen: false };

  private toggle = (property: keyof State) => () =>
    this.setState({ [property]: !this.state[property] });

  public render() {
    const isOpen = this.state.isOpen ? "open" : "";
    let { className } = this.props;
    const { helpText } = this.props;
    const cn = className ? className += " title-help" : "title-help";
    return <div className={cn}>
      <div className={`fa fa-question-circle title-help-icon ${isOpen}`}
        onClick={this.toggle("isOpen")} >
        <div className="title-help-text">
          <i>{t(helpText)}</i>
          {this.props.docPage &&
            <a
              href={docLink(this.props.docPage)}
              target="_blank">
              {" " + t("Documentation")}
              <i className="fa fa-external-link" />
            </a>}
        </div>
      </div>
    </div>;
  }
}
