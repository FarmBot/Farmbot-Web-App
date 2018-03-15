class CreateDeviceConfigs < ActiveRecord::Migration[5.1]
  def change
    create_table :device_configs do |t|
      t.references :device, foreign_key: true
      t.string     :key,    limit: 100
      t.string     :value,  limit: 300

      t.timestamps
    end
  end
end
