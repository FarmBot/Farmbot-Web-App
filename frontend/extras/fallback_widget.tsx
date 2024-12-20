import React from "react";
import { Widget, WidgetHeader, WidgetBody } from "../ui";
import { t } from "../i18next_wrapper";

/*
 * Widget to display if the desired widget fails to load.
 *
 * Example usage where `this.props.feed` is required, but may be undefined:
 *   {this.props.feed
 *     ? <WebcamPanel
 *         bot={this.props.bot}
 *         feed={this.props.feed}
 *         dispatch={this.props.dispatch} />
 *     : <FallbackWidget
 *         title="Webcam"
 *         helpText={ToolTips.WEBCAM} />}
 */

export interface FallbackWidgetProps {
  title: string;
  helpText?: string;
}

export class FallbackWidget extends
  React.Component<FallbackWidgetProps, {}> {

  render() {
    return <Widget>
      <WidgetHeader
        title={t(this.props.title)}
        helpText={this.props.helpText} />
      <WidgetBody>
        {t("Widget load failed.")}
      </WidgetBody>
    </Widget>;
  }
}
