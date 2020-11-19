class RemoveLegacyFields < ActiveRecord::Migration[6.0]
  def change
    remove_column :sequences, :migrated_nodes, :boolean
    remove_column :points, :migrated_at, :datetime
    remove_column :firmware_configs, :api_migrated, :boolean
    remove_column :fbos_configs, :beta_opt_in, :boolean
    remove_column :fbos_configs, :auto_sync, :boolean
    remove_column :fbos_configs, :api_migrated, :boolean
    remove_column :devices, :last_ota, :datetime
    remove_column :devices, :last_ota_checkup, :datetime
  end
end
