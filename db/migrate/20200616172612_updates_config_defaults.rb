class UpdatesConfigDefaults < ActiveRecord::Migration[6.0]
  def change
    change_column_default(:firmware_configs, :movement_stop_at_home_x, from: 0, to: 1)
    change_column_default(:firmware_configs, :movement_stop_at_home_y, from: 0, to: 1)
    change_column_default(:firmware_configs, :movement_stop_at_home_z, from: 0, to: 1)
    change_column_default(:firmware_configs, :movement_stop_at_max_x, from: 0, to: 1)
    change_column_default(:firmware_configs, :movement_stop_at_max_y, from: 0, to: 1)
    change_column_default(:firmware_configs, :movement_stop_at_max_z, from: 0, to: 1)
    change_column_default(:web_app_configs, :legend_menu_open, from: false, to: true)
  end
end
