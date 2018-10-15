class ChangeDefaultApiMigrated < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:fbos_configs, :api_migrated, from: false, to: true)
    change_column_default(:firmware_configs, :api_migrated, from: false, to: true)
  end
end
