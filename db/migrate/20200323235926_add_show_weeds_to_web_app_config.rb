class AddShowWeedsToWebAppConfig < ActiveRecord::Migration[6.0]
  def change
    add_column  :web_app_configs,
    :show_weeds,
    :boolean,
    default: false
  end
end
