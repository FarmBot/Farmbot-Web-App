import * as React from "react";
import { Widget, WidgetHeader } from "../../ui/index";
import { t } from "i18next";
import { ToolTips } from "../../constants";
import { WebcamPanelProps } from "./interfaces";
import { clamp } from "lodash";
import { PLACEHOLDER_FARMBOT } from "../../farmware/images/image_flipper";

type State = {
  /** We might need to move this in to Redux and use a UUID instead of an index,
   * depending on user needs.
   */
  current: number;
};

export class Show extends React.Component<WebcamPanelProps, State> {

  state: State = {
    current: 0
  };

  render() {
    const { props } = this;
    const unsaved = !!props.feeds.filter(x => x.specialStatus !== undefined).length;
    const f = this.props.feeds.map(x => x.body);
    const flipper = new Flipper(f, {
      name: "Missing",
      url: PLACEHOLDER_FARMBOT
    }, this.state.current);
    const msg = this.props.feeds.length ?
      "" : t(`No webcams yet. Click the edit button to add a feed URL.`);
    return (
      <Widget>
        <WidgetHeader title="Webcams" helpText={ToolTips.WEBCAM}>
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

class Flipper<T> {
  private go = (n: number) =>
    (cb: (next: T | undefined, index: number) => void) => {
      this.inc(n);
      console.log("HEY" + this.index);
      cb(this.current, this.index);
    }

  private inc = (num: number) => {
    const i = this.index;
    this.index = clamp(i + num, 0, this.list.length - 1);
    return this.index;
  }

  get current(): T { return this.list[this.index] || this.fallback; }

  constructor(public list: T[],
    public fallback: T,
    private index: number,
  ) { }

  up = this.go(1);
  down = this.go(-1);

}
