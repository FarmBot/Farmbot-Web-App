class RemoveMapXlFromWebAppConfigs < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    remove_column :web_app_configs, :map_xl, :boolean, default: false
  end
end
