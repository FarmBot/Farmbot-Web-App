import React from "react";
import { noop } from "lodash";
import { NavigateFunction, useNavigate } from "react-router";

export const NavigationContext = React.createContext<NavigateFunction>(noop);

export function NavigationProvider(props: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return <NavigationContext.Provider value={navigate}>
    {props.children}
  </NavigationContext.Provider>;
}
