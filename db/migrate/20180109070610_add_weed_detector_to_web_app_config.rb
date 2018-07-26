class AddWeedDetectorToWebAppConfig < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column  :web_app_configs,
                :weed_detector,
                :boolean,
                default: false
  end
end
