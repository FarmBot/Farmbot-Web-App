class UpdateDefaultStallSensitivity < ActiveRecord::Migration[6.0]
  def change
    change_column_default(:firmware_configs, :movement_stall_sensitivity_x, from: 30, to: 63)
    change_column_default(:firmware_configs, :movement_stall_sensitivity_y, from: 30, to: 63)
    change_column_default(:firmware_configs, :movement_stall_sensitivity_z, from: 30, to: 63)
  end
end
