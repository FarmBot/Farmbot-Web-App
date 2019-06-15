class AddConfirmPlantDeletionToWebAppConfigs < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :web_app_configs,
    :confirm_plant_deletion,
    :boolean,
    default: true
  end
end
