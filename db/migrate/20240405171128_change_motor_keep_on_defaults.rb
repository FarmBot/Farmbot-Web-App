class ChangeMotorKeepOnDefaults < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:firmware_configs, :movement_keep_active_x, from: 1, to: 0)
    change_column_default(:firmware_configs, :movement_keep_active_y, from: 1, to: 0)
  end
end
