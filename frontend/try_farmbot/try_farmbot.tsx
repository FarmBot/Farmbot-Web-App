import React from "react";
import { DemoIframe } from "../demo/demo_iframe";

const LOADING = <div> <br /> <br /> <br /> <br />Loading... </div>;

export class TryFarmbot extends DemoIframe {
  componentDidMount = () => {
    console.log("Woo");
    this.requestAccount().then(() => console.log("OK"), (e) => console.dir(e));
  }

  render = () => {
    console.log("Loading demo...");
    if (this.state.error) {
      return this.no();
    } else {
      return LOADING;
    }
  }
}
