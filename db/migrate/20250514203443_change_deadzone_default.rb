class ChangeDeadzoneDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:firmware_configs, :movement_calibration_deadzone_x, from: 50, to: 250)
    change_column_default(:firmware_configs, :movement_calibration_deadzone_y, from: 50, to: 250)
  end
end
