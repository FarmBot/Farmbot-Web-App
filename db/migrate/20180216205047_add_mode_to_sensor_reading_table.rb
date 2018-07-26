class AddModeToSensorReadingTable < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :sensor_readings, :mode, :integer, default: 0
  end
end
