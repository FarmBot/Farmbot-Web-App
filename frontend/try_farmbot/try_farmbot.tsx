import React from "react";
import { DemoIframe } from "../demo/demo_iframe";
import { getUrlQuery } from "../util/urls";

export const DEMO_LOADING = <h1 className="initial-loading-text">Loading...</h1>;

export const getTryFarmbotProductLine = () => getUrlQuery("productLine");

export class TryFarmbot extends DemoIframe {
  componentDidMount = () => {
    const productLine = getTryFarmbotProductLine();
    productLine
      ? this.setState({ productLine }, this.requestAccount)
      : this.requestAccount();
  };

  render = () => {
    if (this.state.error) {
      return this.no();
    }
    return DEMO_LOADING;
  };
}
