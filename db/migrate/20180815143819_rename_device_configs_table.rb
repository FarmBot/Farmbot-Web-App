class RenameDeviceConfigsTable < ActiveRecord::Migration[5.2]
  def change
    rename_table :device_configs, :farmware_envs
  end
end
