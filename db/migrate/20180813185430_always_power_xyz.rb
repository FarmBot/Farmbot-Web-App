class AlwaysPowerXyz < ActiveRecord::Migration[5.2]
  def change
    fc = :firmware_configs

    change_column fc, :encoder_enabled_x,      :integer, default: 1
    change_column fc, :encoder_enabled_y,      :integer, default: 1
    change_column fc, :encoder_enabled_z,      :integer, default: 1
    change_column fc, :movement_keep_active_x, :integer, default: 1
    change_column fc, :movement_keep_active_y, :integer, default: 1
    change_column fc, :movement_keep_active_z, :integer, default: 1
  end
end
