import * as React from "react";
import { mount } from "enzyme";

export function svgMount(element: React.ReactElement) {
  return mount(<svg>{element}</svg>);
}
