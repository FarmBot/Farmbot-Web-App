class ExtendFarmwareEnvValueColumn < ActiveRecord::Migration[6.1]
  def change
    change_column :farmware_envs, :value, :string, limit: 1000
  end
end
