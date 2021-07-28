class AddInterpolationMapToWebAppConfig < ActiveRecord::Migration[6.1]
  def change
    add_column :web_app_configs, :show_soil_interpolation_map, :boolean, default: false
    add_column :web_app_configs, :show_moisture_interpolation_map, :boolean, default: false
  end
end
