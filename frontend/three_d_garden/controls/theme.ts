export const CONTROL_COLORS = {
  primary: "dodgerblue",
  hover: "deepskyblue",
  active: "orange",
  activeHover: "darkorange",
  neutral: "dimgray",
  neutralHover: "gray",
  disabled: "darkgray",
  x: "#ff0000",
  y: "#39ff14",
  z: "#0000ff",
};

export const CONTROL_COLOR_PRESETS = {
  primary: {
    color: CONTROL_COLORS.primary,
    hoverColor: CONTROL_COLORS.hover,
  },
  x: {
    color: CONTROL_COLORS.x,
    hoverColor: "#cc0000",
  },
  y: {
    color: CONTROL_COLORS.y,
    hoverColor: "#2ecc10",
  },
  z: {
    color: CONTROL_COLORS.z,
    hoverColor: "#0000cc",
  },
  origin: {
    color: "white",
    hoverColor: "lightgray",
  },
} as const;

export type ControlColorType = keyof typeof CONTROL_COLOR_PRESETS;

export const resolveControlColors = (
  colorType?: ControlColorType,
  color?: string,
  hoverColor?: string,
) => {
  const preset = colorType
    ? CONTROL_COLOR_PRESETS[colorType]
    : undefined;
  const resolvedColor =
    color || preset?.color || CONTROL_COLOR_PRESETS.primary.color;
  return {
    color: resolvedColor,
    hoverColor: hoverColor || preset?.hoverColor || resolvedColor,
  };
};

export const CONTROL_HOVER_SCALE = 1.25;
export const CONTROL_RENDER_ORDER = 1001;
export const CONTROL_ARROW_WIDTH = 10;
export const CONTROL_SIZE_ARROW_WIDTH = 20;

export interface ControlRenderOptions {
  renderOnTop?: boolean;
  depthTest?: boolean;
  depthWrite?: boolean;
  renderOrder?: number;
}

export const resolveControlRenderOptions = (
  options: ControlRenderOptions,
) => options.renderOnTop
  ? {
    depthTest: false,
    depthWrite: false,
    renderOrder: Math.max(
      options.renderOrder ?? CONTROL_RENDER_ORDER,
      CONTROL_RENDER_ORDER,
    ),
  }
  : {
    depthTest: options.depthTest,
    depthWrite: options.depthWrite,
    renderOrder: options.renderOrder,
  };
