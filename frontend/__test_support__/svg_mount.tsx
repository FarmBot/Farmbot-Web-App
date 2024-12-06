import React from "react";
import { mount } from "enzyme";

export function svgMount(element: React.ReactNode) {
  return mount<React.ReactNode>(<svg>{element}</svg>);
}
