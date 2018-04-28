class AddXySwapToWebAppConfigs < ActiveRecord::Migration[5.1]
  def change
    add_column  :web_app_configs,
                :xy_swap,
                :boolean,
                default: false
  end
end
