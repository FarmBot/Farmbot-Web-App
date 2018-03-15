import { validBotLocationData } from "../util";
import { JogMovementControlsProps } from "./interfaces";

const _ = (nr_steps: number | undefined, steps_mm: number | undefined) => {
  return (nr_steps || 0) / (steps_mm || 1);
};

function calculateAxialLengths(props: JogMovementControlsProps) {
  const fwParams = props.firmwareSettings;

  return {
    x: _(fwParams.movement_axis_nr_steps_x, fwParams.movement_step_per_mm_x),
    y: _(fwParams.movement_axis_nr_steps_y, fwParams.movement_step_per_mm_y),
    z: _(fwParams.movement_axis_nr_steps_z, fwParams.movement_step_per_mm_z),
  };
}

export function buildDirectionProps(props: JogMovementControlsProps) {
  const { firmwareSettings } = props;
  const { location_data } = props.bot.hardware;
  const botLocationData = validBotLocationData(location_data);
  const lengths = calculateAxialLengths(props);
  return {
    x: {
      isInverted: props.x_axis_inverted,
      stopAtHome: !!firmwareSettings.movement_stop_at_home_x,
      stopAtMax: !!firmwareSettings.movement_stop_at_max_x,
      axisLength: lengths.x,
      negativeOnly: !!firmwareSettings.movement_home_up_x,
      position: botLocationData.position.x
    },
    y: {
      isInverted: props.y_axis_inverted,
      stopAtHome: !!firmwareSettings.movement_stop_at_home_y,
      stopAtMax: !!firmwareSettings.movement_stop_at_max_y,
      axisLength: lengths.y,
      negativeOnly: !!firmwareSettings.movement_home_up_y,
      position: botLocationData.position.y
    },
    z: {
      isInverted: props.z_axis_inverted,
      stopAtHome: !!firmwareSettings.movement_stop_at_home_z,
      stopAtMax: !!firmwareSettings.movement_stop_at_max_z,
      axisLength: lengths.z,
      negativeOnly: !!firmwareSettings.movement_home_up_z,
      position: botLocationData.position.z
    },
  };
}
