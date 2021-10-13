import React from "react";
import { mount } from "enzyme";

export function svgMount(element: React.ReactElement) {
  return mount<React.ReactElement>(<svg>{element}</svg>);
}
