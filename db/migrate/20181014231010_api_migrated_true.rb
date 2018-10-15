class ApiMigratedTrue < ActiveRecord::Migration[5.2]
  def change
    change_column_default(:fbos_configs,     :api_migrated, true)
    change_column_default(:firmware_configs, :api_migrated, true)
    puts "This part needs a cutoff date:"
    [FbosConfig, FirmwareConfig].map { |x| x.update_all(api_migrated: true) }
  end
end
