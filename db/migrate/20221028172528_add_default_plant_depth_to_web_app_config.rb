class AddDefaultPlantDepthToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :default_plant_depth, :integer, default: 0
  end

  def down
    remove_column :web_app_configs, :default_plant_depth
  end
end
