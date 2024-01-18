class AddEnable3dElectronicsBoxTopToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :enable_3d_electronics_box_top, :boolean, default: true
  end

  def down
    remove_column :web_app_configs, :enable_3d_electronics_box_top
  end
end
