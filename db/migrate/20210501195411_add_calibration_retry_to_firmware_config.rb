class AddCalibrationRetryToFirmwareConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :firmware_configs, :movement_calibration_retry_x, :integer, default: 3
    add_column :firmware_configs, :movement_calibration_retry_y, :integer, default: 3
    add_column :firmware_configs, :movement_calibration_retry_z, :integer, default: 3
  end
end
