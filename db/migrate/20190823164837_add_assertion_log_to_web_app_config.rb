class AddAssertionLogToWebAppConfig < ActiveRecord::Migration[5.2]
  safety_assured

  def change
    add_column :web_app_configs,
               :assertion_log,
               :integer,
               default: 1
  end
end
