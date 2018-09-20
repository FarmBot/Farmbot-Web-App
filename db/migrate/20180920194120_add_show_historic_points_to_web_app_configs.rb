class AddShowHistoricPointsToWebAppConfigs < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :show_historic_points,
    :boolean,
    default: false
  end
end
