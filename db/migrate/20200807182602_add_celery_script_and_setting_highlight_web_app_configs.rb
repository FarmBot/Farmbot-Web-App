class AddCeleryScriptAndSettingHighlightWebAppConfigs < ActiveRecord::Migration[6.0]
  def change
    add_column :web_app_configs, :view_celery_script, :boolean, default: false
    add_column :web_app_configs, :highlight_modified_settings, :boolean, default: false
  end
end
