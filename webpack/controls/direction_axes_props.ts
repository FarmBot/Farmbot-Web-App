import { validBotLocationData } from "../util";
import { JogMovementControlsProps } from "./interfaces";

const _ = (nr_steps: number | undefined, steps_mm: number | undefined) => {
  return (nr_steps || 0) / (steps_mm || 1);
};

function calculateAxialLengths(props: JogMovementControlsProps) {
  const mp = props.bot.hardware.mcu_params;

  return {
    x: _(mp.movement_axis_nr_steps_x, mp.movement_step_per_mm_x),
    y: _(mp.movement_axis_nr_steps_y, mp.movement_step_per_mm_y),
    z: _(mp.movement_axis_nr_steps_z, mp.movement_step_per_mm_z),
  };
}
export function buildDirectionProps(props: JogMovementControlsProps) {
  const { location_data, mcu_params } = props.bot.hardware;
  const botLocationData = validBotLocationData(location_data);
  const lengths = calculateAxialLengths(props);
  return {
    x: {
      isInverted: props.x_axis_inverted,
      stopAtHome: !!mcu_params.movement_stop_at_home_x,
      stopAtMax: !!mcu_params.movement_stop_at_max_x,
      axisLength: lengths.x,
      negativeOnly: !!mcu_params.movement_home_up_x,
      position: botLocationData.position.x
    },
    y: {
      isInverted: props.y_axis_inverted,
      stopAtHome: !!mcu_params.movement_stop_at_home_y,
      stopAtMax: !!mcu_params.movement_stop_at_max_y,
      axisLength: lengths.y,
      negativeOnly: !!mcu_params.movement_home_up_y,
      position: botLocationData.position.y
    },
    z: {
      isInverted: props.z_axis_inverted,
      stopAtHome: !!mcu_params.movement_stop_at_home_z,
      stopAtMax: !!mcu_params.movement_stop_at_max_z,
      axisLength: lengths.z,
      negativeOnly: !!mcu_params.movement_home_up_z,
      position: botLocationData.position.z
    },
  };
}
