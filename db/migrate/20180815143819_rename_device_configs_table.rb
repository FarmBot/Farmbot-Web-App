class RenameDeviceConfigsTable < ActiveRecord::Migration[5.2]
  def up
    if ActiveRecord::Base.connection.table_exists? "device_configs"
      rename_table :device_configs, :farmware_envs
    end
  end

  def down
    if ActiveRecord::Base.connection.table_exists? "farmware_envs"
      rename_table :farmware_envs, :device_configs
    end
  end
end
