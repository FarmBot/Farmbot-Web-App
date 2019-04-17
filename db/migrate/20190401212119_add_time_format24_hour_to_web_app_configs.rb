class AddTimeFormat24HourToWebAppConfigs < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :time_format_24_hour,
    :boolean,
    default: false
  end
end
