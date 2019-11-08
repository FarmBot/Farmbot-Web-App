class RemoveMapXlFromWebAppConfigs < ActiveRecord::Migration[5.2]

  def change
    remove_column :web_app_configs, :map_xl, :boolean, default: false
  end
end
