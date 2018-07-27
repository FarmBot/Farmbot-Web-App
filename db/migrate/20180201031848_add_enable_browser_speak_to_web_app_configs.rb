class AddEnableBrowserSpeakToWebAppConfigs < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column  :web_app_configs,
                :enable_browser_speak,
                :boolean,
                default: false
  end
end
