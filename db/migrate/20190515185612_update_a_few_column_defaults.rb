class UpdateAFewColumnDefaults < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:firmware_configs, :encoder_enabled_x, from: 1, to: 0)
    change_column_default(:firmware_configs, :encoder_enabled_y, from: 1, to: 0)
    change_column_default(:firmware_configs, :encoder_enabled_z, from: 1, to: 0)
    change_column_default(:web_app_configs,  :show_spread, from: false, to: true)
  end
end
