class AddLandingPageToWebAppConfig < ActiveRecord::Migration[6.1]
  def up
    add_column :web_app_configs, :landing_page, :string, limit: 100, default: "controls"
  end

  def down
    remove_column :web_app_configs, :landing_page
  end
end
