class AddHideSensorsToWebAppConfig < ActiveRecord::Migration[5.2]

  def change
    add_column :web_app_configs,
    :hide_sensors,
    :boolean,
    default: false
  end
end
