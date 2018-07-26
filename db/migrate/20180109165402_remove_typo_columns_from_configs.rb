class RemoveTypoColumnsFromConfigs < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    remove_column :firmware_configs, :status_general, :boolean
    remove_column :web_app_configs, :successs_log, :boolean
    rename_column :web_app_configs, :weed_detector, :stub_config
  end
end
