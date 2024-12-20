class AddDarkModeToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :dark_mode, :boolean, default: false
  end

  def down
    remove_column :web_app_configs, :dark_mode
  end
end
