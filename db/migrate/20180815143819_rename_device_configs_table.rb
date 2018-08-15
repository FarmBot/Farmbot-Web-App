class RenameDeviceConfigsTable < ActiveRecord::Migration[5.2]
  def up
    rename_table :device_configs, :farmware_envs
  end

  def down
    rename_table :farmware_envs, :device_configs
  end
end
