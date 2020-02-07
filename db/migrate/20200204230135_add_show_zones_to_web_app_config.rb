class AddShowZonesToWebAppConfig < ActiveRecord::Migration[6.0]
  def change
    add_column  :web_app_configs,
                :show_zones,
                :boolean,
                default: false
  end
end
