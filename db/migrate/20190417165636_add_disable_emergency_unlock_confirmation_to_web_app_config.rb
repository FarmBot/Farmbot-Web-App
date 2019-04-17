class AddDisableEmergencyUnlockConfirmationToWebAppConfig < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :disable_emergency_unlock_confirmation,
    :boolean,
    default: false
  end
end
