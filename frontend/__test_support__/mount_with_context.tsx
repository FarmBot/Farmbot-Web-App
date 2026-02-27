import React from "react";
import { render } from "@testing-library/react";
import { NavigationContext } from "../routes_helpers";

export const renderWithContext = (element: React.ReactElement) => {
  return render(
    <NavigationContext.Provider value={mockNavigate}>
      {element}
    </NavigationContext.Provider>,
  );
};
