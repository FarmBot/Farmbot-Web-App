class AddStealthAndDeadzoneToFirmwareConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :firmware_configs, :movement_calibration_deadzone_x, :integer, default: 50
    add_column :firmware_configs, :movement_calibration_deadzone_y, :integer, default: 50
    add_column :firmware_configs, :movement_calibration_deadzone_z, :integer, default: 250
    add_column :firmware_configs, :movement_axis_stealth_x, :integer, default: 0
    add_column :firmware_configs, :movement_axis_stealth_y, :integer, default: 0
    add_column :firmware_configs, :movement_axis_stealth_z, :integer, default: 0
  end
end
