class AddHideSensorsToWebAppConfig < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :hide_sensors,
    :boolean,
    default: false
  end
end
