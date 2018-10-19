class CreateDeviceSerialNumbers < ActiveRecord::Migration[5.2]
  def change
    create_table :device_serial_numbers do |t|
      t.references :device, foreign_key: true
      t.string     :serial_number,
                    null:       false,
                    limit:      16,
                    uniqueness: true
      t.timestamps
    end
  end
end
