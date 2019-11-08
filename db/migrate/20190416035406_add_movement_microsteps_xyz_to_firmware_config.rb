class AddMovementMicrostepsXyzToFirmwareConfig < ActiveRecord::Migration[5.2]

  def change
    add_column :firmware_configs, :movement_microsteps_x, :integer, default: 1
    add_column :firmware_configs, :movement_microsteps_y, :integer, default: 1
    add_column :firmware_configs, :movement_microsteps_z, :integer, default: 1
  end
end
