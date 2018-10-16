class AddShowSensorReadingsToWebAppConfigs < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :show_sensor_readings,
    :boolean,
    default: false
  end
end
