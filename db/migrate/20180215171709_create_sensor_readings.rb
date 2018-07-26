class CreateSensorReadings < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    create_table :sensor_readings do |t|
      t.references :device, foreign_key: true
      t.float :x
      t.float :y
      t.float :z
      t.integer :value
      t.integer :pin

      t.timestamps
    end
  end
end
