class AddThreeDGardenToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :three_d_garden, :boolean, default: false
  end

  def down
    remove_column :web_app_configs, :three_d_garden
  end
end
