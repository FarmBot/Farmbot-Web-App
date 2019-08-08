import * as React from "react";
import { Widget, WidgetHeader, FallbackImg, WidgetBody } from "../../ui/index";

import { ToolTips } from "../../constants";
import { WebcamPanelProps } from "./interfaces";
import { PLACEHOLDER_FARMBOT } from "../../farmware/images/image_flipper";
import { Flipper } from "./flipper";
import { sortedFeeds } from "./edit";
import { t } from "../../i18next_wrapper";

type State = {
  /** Current index in the webcam feed list.
   *
   * We might need to move this in to Redux and use a UUID instead of an index,
   * depending on user needs.
   */
  current: number;
};

const FALLBACK_FEED = { name: "", url: PLACEHOLDER_FARMBOT };

export function IndexIndicator(props: { i: number, total: number }): JSX.Element {
  const percentWidth = 100 / props.total;
  return props.total > 1 ? <div
    className="index-indicator"
    style={{
      width: `${percentWidth}%`,
      left: `calc(-10px + ${props.i} * ${percentWidth}%)`
    }} /> : <div />;
}

export class Show extends React.Component<WebcamPanelProps, State> {
  NO_FEED = t(`No webcams yet. Click the edit button to add a feed URL.`);
  PLACEHOLDER_FEED = t(`Click the edit button to add or edit a feed URL.`);

  getMessage(currentUrl: string) {
    if (this.props.feeds.length) {
      if (currentUrl.includes(PLACEHOLDER_FARMBOT)) {
        return this.PLACEHOLDER_FEED;
      } else {
        return "";
      }
    } else {
      return this.NO_FEED;
    }
  }

  state: State = { current: 0 };

  render() {
    const { props } = this;
    const feeds = sortedFeeds(this.props.feeds).map(x => x.body);
    const flipper = new Flipper(feeds, FALLBACK_FEED, this.state.current);
    const title = flipper.current.name || t("Webcam Feeds");
    const msg = this.getMessage(flipper.current.url);
    const imageClass = msg.length > 0 ? "no-flipper-image-container" : "";
    return <Widget className="webcam-widget">
      <WidgetHeader title={title} helpText={ToolTips.WEBCAM}>
        <button
          className="fb-button gray"
          onClick={props.onToggle}>
          {t("Edit")}
        </button>
        <IndexIndicator i={this.state.current} total={feeds.length} />
      </WidgetHeader>
      <WidgetBody>
        <div className="image-flipper">
          <div className={imageClass}>
            <p>{msg}</p>
            <FallbackImg className="image-flipper-image"
              src={flipper.current.url}
              fallback={PLACEHOLDER_FARMBOT} />
          </div>
          <button
            onClick={() => flipper.down((_, current) => this.setState({ current }))}
            hidden={feeds.length < 2}
            disabled={false}
            className="image-flipper-left fb-button">
            {t("Prev")}
          </button>
          <button
            onClick={() => flipper.up((_, current) => this.setState({ current }))}
            hidden={feeds.length < 2}
            disabled={false}
            className="image-flipper-right fb-button">
            {t("Next")}
          </button>
        </div>
      </WidgetBody>
    </Widget>;
  }
}
