class AddShowSensorReadingsToWebAppConfigs < ActiveRecord::Migration[5.2]

  def change
    add_column :web_app_configs,
    :show_sensor_readings,
    :boolean,
    default: false
  end
end
