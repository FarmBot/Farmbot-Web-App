import React from "react";
import { noop } from "lodash";
import { useNavigate } from "react-router-dom";

type Navigate = (url: string) => void;

export const NavigationContext = React.createContext<Navigate>(noop);

export function NavigationProvider(props: { children: React.ReactNode }) {
  const navigate = useNavigate();
  return <NavigationContext.Provider value={navigate}>
    {props.children}
  </NavigationContext.Provider>;
}
