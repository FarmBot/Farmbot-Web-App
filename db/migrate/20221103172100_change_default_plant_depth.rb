class ChangeDefaultPlantDepth < ActiveRecord::Migration[6.1]
  def change
    change_column_default(:web_app_configs, :default_plant_depth, 5)
  end
end
