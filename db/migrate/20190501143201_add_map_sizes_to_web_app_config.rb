class AddMapSizesToWebAppConfig < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs, :map_size_x, :integer, default: 2900
    add_column :web_app_configs, :map_size_y, :integer, default: 1400
  end
end
