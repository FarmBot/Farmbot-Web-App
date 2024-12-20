import React from "react";
import { mount } from "enzyme";
import { NavigationProvider } from "../routes_helpers";

export const mountWithContext = (element: React.ReactElement) =>
  mount<React.ReactElement>(<NavigationProvider>{element}</NavigationProvider>);
