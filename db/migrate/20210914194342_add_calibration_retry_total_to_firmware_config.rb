class AddCalibrationRetryTotalToFirmwareConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :firmware_configs, :movement_calibration_retry_total_x, :integer, default: 10
    add_column :firmware_configs, :movement_calibration_retry_total_y, :integer, default: 10
    add_column :firmware_configs, :movement_calibration_retry_total_z, :integer, default: 10
  end
end
