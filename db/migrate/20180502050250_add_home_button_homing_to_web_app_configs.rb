class AddHomeButtonHomingToWebAppConfigs < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column  :web_app_configs,
                :home_button_homing,
                :boolean,
                default: false
  end
end
