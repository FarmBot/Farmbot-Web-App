class CreateTelemetry < ActiveRecord::Migration[6.1]
  def up
    create_table :telemetries do |t|
      t.references :device, foreign_key: true
      t.integer :soc_temp
      t.integer :wifi_level_percent
      t.integer :uptime
      t.integer :memory_usage
      t.integer :disk_usage
      t.integer :cpu_usage
      t.string :throttled, limit: 10
      t.string :target, limit: 10
      t.string :fbos_version, limit: 20
      t.string :firmware_hardware, limit: 20

      t.timestamps
    end
  end

  def down
    drop_table :telemetries do |t|
      t.references :device, foreign_key: true
      t.integer :soc_temp
      t.integer :wifi_level_percent
      t.integer :uptime
      t.integer :memory_usage
      t.integer :disk_usage
      t.integer :cpu_usage
      t.string :throttled, limit: 10
      t.string :target, limit: 10
      t.string :fbos_version, limit: 20
      t.string :firmware_hardware, limit: 20

      t.timestamps
    end
  end
end
