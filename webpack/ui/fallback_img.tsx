import * as React from "react";
import { defensiveClone } from "../util";
import { t } from "i18next";

type ImgTag = React.HTMLProps<HTMLImageElement>;

interface Props extends ImgTag {
  src: string;
  fallback: string;
}

type State = Partial<{ needsFallback: boolean }>;
/** Like a normal `<img>`, but it has a `fallback` URL if the image does not
 * load*/
export class FallbackImg extends React.Component<Props, State> {

  state: State = { needsFallback: false };

  get imgProps() {
    const imProps: ImgTag = defensiveClone(this.props);
    // React will complain at runtime if <img/> has extra props.
    // Typescript will compile at compile if I don't use `any` here:
    delete (imProps as any).fallback;
    return imProps;
  }

  componentWillReceiveProps(next: Props) {
    // Sorry. The webcam page needs live updates. <img/> tag was acting wonky.
    (next.src !== this.props.src) && this.setState({ needsFallback: false });
  }

  fallback = () => {
    return (
      <div className="webcam-stream-unavailable">
        <img src={this.props.fallback} style={{ maxWidth: "100%" }} />
        <text>
          {t("Unable to load webcam feed.")}
        </text>
      </div>
    );
  }

  dontFallback = () => {
    const imgProps: Props = defensiveClone(this.props);
    delete imgProps.fallback;
    return (
      <div className="webcam-stream-valid">
        <img
          onError={() => this.setState({ needsFallback: true })}
          src={this.props.src} />
      </div>
    );
  }

  render() {
    return ((this.state.needsFallback) ? this.fallback : this.dontFallback)();
  }
}
