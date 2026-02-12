import React from "react";
import { render } from "@testing-library/react";

export function svgMount(element: React.ReactNode) {
  return render(<svg>{element}</svg>);
}
