class ChangeFirmwareConfigDefaults < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:firmware_configs, :movement_calibration_retry_x, 1)
    change_column_default(:firmware_configs, :movement_calibration_retry_y, 1)
    change_column_default(:firmware_configs, :movement_calibration_retry_z, 1)

    change_column_default(:firmware_configs, :movement_motor_current_x, 1000)
    change_column_default(:firmware_configs, :movement_motor_current_y, 1000)
    change_column_default(:firmware_configs, :movement_motor_current_z, 1000)

    change_column_default(:firmware_configs, :movement_home_spd_x, 400)
    change_column_default(:firmware_configs, :movement_home_spd_y, 400)
    change_column_default(:firmware_configs, :movement_home_spd_z, 400)
  end
end
