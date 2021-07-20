class ChangeStealthConfigDefault < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:firmware_configs, :movement_axis_stealth_x, 1)
    change_column_default(:firmware_configs, :movement_axis_stealth_y, 1)
    change_column_default(:firmware_configs, :movement_axis_stealth_z, 1)
  end
end
