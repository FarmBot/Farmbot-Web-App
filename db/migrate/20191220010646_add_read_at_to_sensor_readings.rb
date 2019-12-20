class AddReadAtToSensorReadings < ActiveRecord::Migration[6.0]
  def change
    add_column :sensor_readings, :read_at, :datetime, default: nil
  end
end
