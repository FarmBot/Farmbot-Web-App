interface Props {
  x_axis_inverted: boolean;
  y_axis_inverted: boolean;
  z_axis_inverted: boolean;
}

interface NumericParams {
  movement_axis_nr_steps_x: number;
  movement_axis_nr_steps_y: number;
  movement_axis_nr_steps_z: number;
  movement_step_per_mm_x: number;
  movement_step_per_mm_y: number;
  movement_step_per_mm_z: number;
}

interface BooleanParams {
  movement_home_up_x: boolean;
  movement_home_up_y: boolean;
  movement_home_up_z: boolean;
  movement_stop_at_home_x: boolean;
  movement_stop_at_home_y: boolean;
  movement_stop_at_home_z: boolean;
  movement_stop_at_max_x: boolean;
  movement_stop_at_max_y: boolean;
  movement_stop_at_max_z: boolean;
}

type McuParams = BooleanParams & NumericParams;

export const wow = (props: Props, mcu_params: McuParams, botLocationData: ) => {
  const directionAxesProps = {
    x: {
      isInverted: props.x_axis_inverted,
      stopAtHome: !!mcu_params.movement_stop_at_home_x,
      stopAtMax: !!mcu_params.movement_stop_at_max_x,
      axisLength: (mcu_params.movement_axis_nr_steps_x || 0)
        / (mcu_params.movement_step_per_mm_x || 1),
      negativeOnly: !!mcu_params.movement_home_up_x,
      position: botLocationData.position.x
    },
    y: {
      isInverted: props.y_axis_inverted,
      stopAtHome: !!mcu_params.movement_stop_at_home_y,
      stopAtMax: !!mcu_params.movement_stop_at_max_y,
      axisLength: (mcu_params.movement_axis_nr_steps_y || 0)
        / (mcu_params.movement_step_per_mm_y || 1),
      negativeOnly: !!mcu_params.movement_home_up_y,
      position: botLocationData.position.y
    },
    z: {
      isInverted: props.z_axis_inverted,
      stopAtHome: !!mcu_params.movement_stop_at_home_z,
      stopAtMax: !!mcu_params.movement_stop_at_max_z,
      axisLength: (mcu_params.movement_axis_nr_steps_z || 0)
        / (mcu_params.movement_step_per_mm_z || 1),
      negativeOnly: !!mcu_params.movement_home_up_z,
      position: botLocationData.position.z
    },
  };
}
