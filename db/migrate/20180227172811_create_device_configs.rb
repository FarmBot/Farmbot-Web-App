class CreateFarmwareEnvs < ActiveRecord::Migration[5.1]
  safety_assured

  def change
    create_table :farmware_envs do |t|
      t.references :device, foreign_key: true
      t.string     :key,    limit: 100
      t.string     :value,  limit: 300

      t.timestamps
    end
  end
end
