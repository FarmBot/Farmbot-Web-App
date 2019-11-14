class AddUserInterfaceReadOnlyModeToWebAppConfig < ActiveRecord::Migration[5.2]
  def change
    add_column :web_app_configs,
               :user_interface_read_only_mode,
               :boolean,
               default: false
  end
end
