class ChangeDefaultsAutoSyncAndHoming < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:fbos_configs, :auto_sync, from: false, to: true)
    change_column_default(:web_app_configs, :home_button_homing, from: false, to: true)
  end
end
