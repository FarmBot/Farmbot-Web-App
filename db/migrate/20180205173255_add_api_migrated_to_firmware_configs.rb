class AddApiMigratedToFirmwareConfigs < ActiveRecord::Migration[5.1]

  def change
    add_column  :firmware_configs,
                :api_migrated,
                :boolean,
                default: false
  end
end
