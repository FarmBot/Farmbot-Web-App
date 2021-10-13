import React from "react";
import { DemoIframe } from "../demo/demo_iframe";

export const DEMO_LOADING = <h1 className="initial-loading-text">Loading...</h1>;

export class TryFarmbot extends DemoIframe {
  componentDidMount = () => {
    this.requestAccount();
  };

  render = () => {
    if (this.state.error) {
      return this.no();
    }
    return DEMO_LOADING;
  };
}
