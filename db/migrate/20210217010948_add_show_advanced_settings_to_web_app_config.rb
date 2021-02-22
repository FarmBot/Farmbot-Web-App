class AddShowAdvancedSettingsToWebAppConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :web_app_configs, :show_advanced_settings, :boolean, default: false
    change_column_default(:web_app_configs,
      :highlight_modified_settings,
      from: false,
      to: true)
  end
end
