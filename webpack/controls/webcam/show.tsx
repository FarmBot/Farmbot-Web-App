import * as React from "react";
import { Widget, WidgetHeader } from "../../ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { WebcamPanelProps } from "./interfaces";
import { PLACEHOLDER_FARMBOT } from "../../farmware/images/image_flipper";
import { Flipper } from "./flipper";

type State = {
  /** Current index in the webcam feed list.
   *
   * We might need to move this in to Redux and use a UUID instead of an index,
   * depending on user needs.
   */
  current: number;
};

const FALLBACK_FEED = { name: "", url: PLACEHOLDER_FARMBOT };

export class Show extends React.Component<WebcamPanelProps, State> {
  NO_FEED = t(`No webcams yet. Click the edit button to add a feed URL.`);

  state: State = { current: 0 };

  render() {
    const { props } = this;
    const unsaved = !!props
      .feeds
      .filter(x => x.specialStatus !== undefined)
      .length;
    const feeds = this.props.feeds.map(x => x.body);
    const flipper = new Flipper(feeds, FALLBACK_FEED, this.state.current);
    const msg = this.props.feeds.length ? "" : this.NO_FEED;
    const title = flipper.current.name || "Webcam Feeds";
    return (
      <Widget>
        <WidgetHeader title={title} helpText={ToolTips.WEBCAM}>
          <button
            className="fb-button gray"
            onClick={props.onToggle}>
            {t("Edit")}
            {unsaved ? "*" : ""}
          </button>
        </WidgetHeader>
        <div className="widget-body">
          <div className="image-flipper">
            <div className="no-flipper-image-container">
              <p>{msg}</p>
              <img
                className="image-flipper-image"
                src={flipper.current.url} />
            </div>
            <button
              onClick={() => flipper.down((_, current) => this.setState({ current }))}
              disabled={false}
              className="image-flipper-left fb-button">
              {t("Prev")}
            </button>
            <button
              onClick={() => flipper.up((_, current) => this.setState({ current }))}
              disabled={false}
              className="image-flipper-right fb-button">
              {t("Next")}
            </button>
          </div>
        </div>
      </Widget>
    );
  }
}
