import React from "react";
import { DemoIframe } from "../demo/demo_iframe";

export const DEMO_LOADING = <div>
  <br />
  <br />
  Loading...
</div>;

export class TryFarmbot extends DemoIframe {
  componentDidMount = () => {
    this.requestAccount();
  }

  render = () => {
    if (this.state.error) {
      return this.no();
    }
    return DEMO_LOADING;
  }
}
