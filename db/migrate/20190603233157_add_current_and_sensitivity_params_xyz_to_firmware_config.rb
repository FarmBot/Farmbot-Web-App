class AddCurrentAndSensitivityParamsXyzToFirmwareConfig < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :firmware_configs, :movement_motor_current_x, :integer, default: 600
    add_column :firmware_configs, :movement_motor_current_y, :integer, default: 600
    add_column :firmware_configs, :movement_motor_current_z, :integer, default: 600
    add_column :firmware_configs, :movement_stall_sensitivity_x, :integer, default: 30
    add_column :firmware_configs, :movement_stall_sensitivity_y, :integer, default: 30
    add_column :firmware_configs, :movement_stall_sensitivity_z, :integer, default: 30
  end
end
