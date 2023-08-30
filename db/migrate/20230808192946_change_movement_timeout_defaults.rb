class ChangeMovementTimeoutDefaults < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:firmware_configs, :movement_timeout_x, from: 120, to: 180)
    change_column_default(:firmware_configs, :movement_timeout_y, from: 120, to: 180)
    change_column_default(:firmware_configs, :movement_timeout_z, from: 120, to: 180)
  end
end
